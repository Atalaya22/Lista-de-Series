import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface DiaryEntry {
  id: number;
  title: string;
  type: 'Pelicula' | 'Serie';
  season?: string;
  date: string;
  rating: number;
  mood: string;
  tags: string[];
  notes: string;
}

interface Highlight {
  label: string;
  value: string;
  hint: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly entries: DiaryEntry[] = [
    {
      id: 1,
      title: 'Aftersun',
      type: 'Pelicula',
      date: '2026-01-30',
      rating: 4.8,
      mood: 'Agridulce',
      tags: ['Intima', 'Emocional', 'Lenta'],
      notes: 'Planos largos y silencios que se sienten como recuerdos.'
    },
    {
      id: 2,
      title: 'The Bear',
      type: 'Serie',
      season: 'Temp. 2',
      date: '2026-01-27',
      rating: 4.6,
      mood: 'Catartica',
      tags: ['Cocina', 'Ansiedad', 'Familia'],
      notes: 'Un caos hermoso. Episodio 6 me dejo sin aire.'
    },
    {
      id: 3,
      title: 'Past Lives',
      type: 'Pelicula',
      date: '2026-01-25',
      rating: 4.4,
      mood: 'Nostalgica',
      tags: ['Romance', 'Destino'],
      notes: 'Pequenos gestos. Conversaciones que se quedan.'
    },
    {
      id: 4,
      title: 'Severance',
      type: 'Serie',
      season: 'Temp. 1',
      date: '2026-01-21',
      rating: 4.7,
      mood: 'Intriga',
      tags: ['Sci-fi', 'Corporativo', 'Distopia'],
      notes: 'Estetica impecable. Final perfecto para debatir.'
    }
  ];

  readonly highlights: Highlight[] = [
    {
      label: 'Tiempo total',
      value: '24h 35m',
      hint: 'Estimado en enero'
    },
    {
      label: 'Estado de animo',
      value: 'Melancolico',
      hint: 'Tema dominante'
    },
    {
      label: 'Lugar favorito',
      value: 'Sala / noche',
      hint: '62% de tus entradas'
    }
  ];

  get moviesCount(): number {
    return this.entries.filter((entry) => entry.type === 'Pelicula').length;
  }

  get seriesCount(): number {
    return this.entries.filter((entry) => entry.type === 'Serie').length;
  }

  get averageRating(): number {
    const total = this.entries.reduce((sum, entry) => sum + entry.rating, 0);
    return total / this.entries.length;
  }
}
