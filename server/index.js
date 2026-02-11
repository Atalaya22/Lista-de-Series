const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool, types } = require('pg');

dotenv.config();

// Keep DATE columns as raw "YYYY-MM-DD" strings to avoid timezone shifts.
types.setTypeParser(1082, (value) => value);

const app = express();
const apiPort = Number(process.env.API_PORT || 3000);

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 8080),
  user: process.env.PGUSER || 'admin',
  password: process.env.PGPASSWORD || 'admin',
  database: process.env.PGDATABASE || 'postgres',
});

app.use(cors());
app.use(express.json());

function toDiaryEntry(row) {
  const normalizedType =
    row.tipo === 'Serie' || row.tipo === 'Anime' || row.tipo === 'Pelicula' ? row.tipo : 'Pelicula';

  return {
    id: row.id,
    title: row.nombre,
    type: normalizedType,
    date: row.fecha || new Date().toISOString().split('T')[0],
    rating: Number(row.calificacion),
    place: row.lugar || 'Sin lugar',
    mood: row.mood || 'Pendiente',
    tags: [],
    notes: row.anotacion || 'Sin nota rapida.',
  };
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS multimedia (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      calificacion INT NOT NULL,
      lugar VARCHAR(50) NOT NULL,
      mood VARCHAR(50) NOT NULL,
      anotacion VARCHAR(255),
      fecha DATE NOT NULL DEFAULT CURRENT_DATE
    );
  `);

  await pool.query(`
    ALTER TABLE multimedia
    ADD COLUMN IF NOT EXISTS fecha DATE NOT NULL DEFAULT CURRENT_DATE;
  `);
}

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    res.json({ ok: true, now: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get('/api/multimedia', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, tipo, calificacion, lugar, mood, anotacion, fecha
      FROM multimedia
      ORDER BY id DESC;
    `);

    res.json(result.rows.map(toDiaryEntry));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/multimedia', async (req, res) => {
  const { title, type, rating, place, mood, notes, date } = req.body || {};

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'El campo title es obligatorio.' });
  }

  const safeType = type === 'Serie' || type === 'Anime' || type === 'Pelicula' ? type : 'Pelicula';
  const parsedRating = Number.parseInt(String(rating), 10);
  const safeRating = Number.isFinite(parsedRating) ? Math.min(Math.max(parsedRating, 0), 5) : 0;
  const safePlace = typeof place === 'string' && place.trim().length > 0 ? place.trim() : 'Sin lugar';
  const safeMood = typeof mood === 'string' && mood.trim().length > 0 ? mood.trim() : 'Pendiente';
  const safeNotes = typeof notes === 'string' ? notes.trim() : '';
  const safeDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;

  try {
    const result = await pool.query(
      `
      INSERT INTO multimedia (nombre, tipo, calificacion, lugar, mood, anotacion, fecha)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::date, CURRENT_DATE))
      RETURNING id, nombre, tipo, calificacion, lugar, mood, anotacion, fecha;
      `,
      [title.trim(), safeType, safeRating, safePlace, safeMood, safeNotes || null, safeDate],
    );

    return res.status(201).json(toDiaryEntry(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ensureSchema()
  .then(() => {
    app.listen(apiPort, () => {
      console.log(`API escuchando en http://localhost:${apiPort}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo iniciar la API:', error);
    process.exit(1);
  });
