const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const apiPort = Number(process.env.API_PORT || 3000);

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.PGHOST || 'localhost';
  const port = Number(process.env.PGPORT || 8080);
  const user = encodeURIComponent(process.env.PGUSER || 'admin');
  const password = encodeURIComponent(process.env.PGPASSWORD || 'admin');
  const database = encodeURIComponent(process.env.PGDATABASE || 'postgres');

  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: buildDatabaseUrl() },
  },
});

app.use(cors());
app.use(express.json());

function toDiaryEntry(row) {
  const normalizedType =
    row.type === 'Serie' || row.type === 'Anime' || row.type === 'Pelicula' ? row.type : 'Pelicula';

  return {
    id: row.id,
    title: row.title,
    type: normalizedType,
    date: row.date ? row.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    rating: Number(row.rating),
    place: row.place || 'Sin lugar',
    mood: row.mood || 'Pendiente',
    tags: [],
    notes: row.notes || 'Sin nota rapida.',
  };
}

async function ensureSchema() {
  await prisma.$connect();
}

app.get('/api/health', async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS now`;
    res.json({ ok: true, now: result[0].now });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get('/api/multimedia', async (_req, res) => {
  try {
    const entries = await prisma.multimedia.findMany({
      orderBy: { id: 'desc' },
    });
    res.json(entries.map(toDiaryEntry));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/multimedia', async (req, res) => {
  const { title, type, rating, place, mood, notes } = req.body || {};

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'El campo title es obligatorio.' });
  }

  const safeType = type === 'Serie' || type === 'Anime' || type === 'Pelicula' ? type : 'Pelicula';
  const parsedRating = Number.parseInt(String(rating), 10);
  const safeRating = Number.isFinite(parsedRating) ? Math.min(Math.max(parsedRating, 0), 5) : 0;
  const safePlace =
    typeof place === 'string' && place.trim().length > 0 ? place.trim() : 'Sin lugar';
  const safeMood = typeof mood === 'string' && mood.trim().length > 0 ? mood.trim() : 'Pendiente';
  const safeNotes = typeof notes === 'string' ? notes.trim() : '';
  try {
    const createdEntry = await prisma.multimedia.create({
      data: {
        title: title.trim(),
        type: safeType,
        rating: safeRating,
        place: safePlace,
        mood: safeMood,
        notes: safeNotes || null,
      },
    });

    return res.status(201).json(toDiaryEntry(createdEntry));
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

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
