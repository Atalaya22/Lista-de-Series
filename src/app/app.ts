import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EntriesComponent } from './entries/entries.component';
import { HighlightsComponent } from './highlights/highlights.component';
import { MoodBoardComponent } from './mood-board/mood-board.component';
import { PendingListComponent, PendingListItem } from './pending-list/pending-list.component';
import { SectionHeaderComponent } from './section-header/section-header.component';
import { DiaryEntry } from './entries/entry-card/entry-card.component';
import { QuickEntryFormComponent } from './quick-entry-form/quick-entry-form.component';
import { TopbarComponent } from './topbar/topbar.component';

interface Highlight {
  label: string;
  value: string;
  hint: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    EntriesComponent,
    PendingListComponent,
    SectionHeaderComponent,
    HighlightsComponent,
    MoodBoardComponent,
    QuickEntryFormComponent,
    TopbarComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  entries: DiaryEntry[] = [
    {
      id: 1,
      title: 'Aftersun',
      type: 'Pelicula',
      imdbId: 'tt19770238',
      date: '2026-01-30',
      rating: 4.8,
      mood: 'Agridulce',
      tags: ['Intima', 'Emocional', 'Lenta'],
      notes: 'Planos largos y silencios que se sienten como recuerdos.',
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
      notes: 'Un caos hermoso. Episodio 6 me dejo sin aire.',
    },
    {
      id: 3,
      title: 'Past Lives',
      type: 'Pelicula',
      imdbId: 'tt13238346',
      date: '2026-01-25',
      rating: 4.4,
      mood: 'Nostalgica',
      tags: ['Romance', 'Destino'],
      notes: 'Pequenos gestos. Conversaciones que se quedan.',
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
      notes: 'Estetica impecable. Final perfecto para debatir.',
    },
  ];

  readonly highlights: Highlight[] = [
    {
      label: 'Tiempo total',
      value: '24h 35m',
      hint: 'Estimado en enero',
    },
    {
      label: 'Estado de animo',
      value: 'Melancolico',
      hint: 'Tema dominante',
    },
    {
      label: 'Lugar favorito',
      value: 'Sala / noche',
      hint: '62% de tus entradas',
    },
  ];

  readonly moodBoard: string[] = [
    'Intenso',
    'Confort',
    'Nostalgia',
    'Energia',
    'Asombro',
    'Catarsis',
  ];

  readonly Pendientes: string = 'Pendientes';

  readonly items: PendingListItem[] = [
    {
      title: 'Perfect Days',
      meta: 'Drama • 1h 55m',
      actionLabel: 'Agregar',
    },
    {
      title: 'True Detective',
      meta: 'Serie • Temp. 1',
      actionLabel: 'Agregar',
    },
  ];

  latestMovie: DiaryEntry | null = null;
  latestMoviePosterUrl: string | null = null;
  latestMoviePosterAlt: string = '';
  latestMoviePosterState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  latestMoviePosterMessage: string = '';
  private posterController?: AbortController;

  ngOnInit(): void {
    this.refreshLatestMovie();
  }

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

  addEntry(entry: DiaryEntry): void {
    this.entries = [entry, ...this.entries];
    if (entry.type === 'Pelicula') {
      this.refreshLatestMovie();
    }
  }

  formatEntryDate(date: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  private refreshLatestMovie(): void {
    this.latestMovie = this.getLatestMovie();
    this.latestMoviePosterUrl = null;
    this.latestMoviePosterAlt = '';
    this.latestMoviePosterMessage = '';

    if (!this.latestMovie) {
      this.latestMoviePosterState = 'idle';
      return;
    }

    this.fetchLatestMoviePoster(this.latestMovie);
  }

  private getLatestMovie(): DiaryEntry | null {
    const movies = this.entries.filter((entry) => entry.type === 'Pelicula');
    if (movies.length === 0) {
      return null;
    }

    return movies.reduce((latest, entry) => {
      return new Date(entry.date) > new Date(latest.date) ? entry : latest;
    }, movies[0]);
  }

  private async fetchLatestMoviePoster(entry: DiaryEntry): Promise<void> {
    if (!entry.imdbId) {
      this.latestMoviePosterState = 'error';
      this.latestMoviePosterMessage = 'Falta el ID de IMDb para esta entrada.';
      return;
    }

    this.posterController?.abort();
    this.posterController = new AbortController();
    this.latestMoviePosterState = 'loading';

    try {
      const response = await fetch('https://graph.imdbapi.dev/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{
            title(id: "${entry.imdbId}") {
              primary_title
              posters {
                url
                width
                height
              }
            }
          }`,
        }),
        signal: this.posterController.signal,
      });

      if (!response.ok) {
        throw new Error(`Respuesta no valida: ${response.status}`);
      }

      const payload = (await response.json()) as {
        data?: {
          title?: {
            primary_title?: string;
            posters?: Array<{ url?: string; width?: number; height?: number }>;
          };
        };
        errors?: Array<{ message?: string }>;
      };

      if (payload.errors?.length) {
        throw new Error(payload.errors[0]?.message ?? 'Error desconocido');
      }

      const posters = payload.data?.title?.posters ?? [];
      const poster = posters
        .filter((item) => item.url)
        .sort((a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0))[0];

      if (!poster?.url) {
        throw new Error('No se encontro caratula.');
      }

      this.latestMoviePosterUrl = poster.url;
      this.latestMoviePosterAlt = `Caratula de ${entry.title}`;
      this.latestMoviePosterState = 'ready';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      this.latestMoviePosterState = 'error';
      this.latestMoviePosterMessage = 'No se pudo cargar la caratula.';
    }
  }
}
