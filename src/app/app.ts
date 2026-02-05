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

  pendingItems: PendingListItem[] = [
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
  latestSeries: DiaryEntry | null = null;
  latestSeriesPosterUrl: string | null = null;
  latestSeriesPosterAlt: string = '';
  latestSeriesPosterState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  latestSeriesPosterMessage: string = '';
  latestAnime: DiaryEntry | null = null;
  latestAnimePosterUrl: string | null = null;
  latestAnimePosterAlt: string = '';
  latestAnimePosterState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  latestAnimePosterMessage: string = '';
  private moviePosterController?: AbortController;
  private seriesPosterController?: AbortController;
  private animePosterController?: AbortController;
  private posterCache = new Map<string, { url: string; alt: string }>();

  ngOnInit(): void {
    this.refreshLatestMovie();
    this.refreshLatestSeries();
    this.refreshLatestAnime();
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
    } else if (entry.type === 'Serie') {
      this.refreshLatestSeries();
    } else if (entry.type === 'Anime') {
      this.refreshLatestAnime();
    }
  }

  addPendingItem(item: PendingListItem): void {
    this.pendingItems = [item, ...this.pendingItems];
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

  private refreshLatestSeries(): void {
    this.latestSeries = this.getLatestEntryByType('Serie');
    this.latestSeriesPosterUrl = null;
    this.latestSeriesPosterAlt = '';
    this.latestSeriesPosterMessage = '';

    if (!this.latestSeries) {
      this.latestSeriesPosterState = 'idle';
      return;
    }

    this.fetchLatestSeriesPoster(this.latestSeries);
  }

  private refreshLatestAnime(): void {
    this.latestAnime = this.getLatestEntryByType('Anime');
    this.latestAnimePosterUrl = null;
    this.latestAnimePosterAlt = '';
    this.latestAnimePosterMessage = '';

    if (!this.latestAnime) {
      this.latestAnimePosterState = 'idle';
      return;
    }

    this.fetchLatestAnimePoster(this.latestAnime);
  }

  private getLatestMovie(): DiaryEntry | null {
    return this.getLatestEntryByType('Pelicula');
  }

  private getLatestEntryByType(type: DiaryEntry['type']): DiaryEntry | null {
    const matches = this.entries.filter((entry) => entry.type === type);
    if (matches.length === 0) {
      return null;
    }

    return matches.reduce((latest, entry) => {
      return new Date(entry.date) > new Date(latest.date) ? entry : latest;
    }, matches[0]);
  }

  private async fetchLatestMoviePoster(entry: DiaryEntry): Promise<void> {
    this.moviePosterController?.abort();
    this.moviePosterController = new AbortController();
    this.latestMoviePosterState = 'loading';

    try {
      const poster = await this.resolvePoster(entry, ['movie'], this.moviePosterController.signal);
      this.latestMoviePosterUrl = poster.url;
      this.latestMoviePosterAlt = poster.alt;
      this.latestMoviePosterState = 'ready';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      this.latestMoviePosterState = 'error';
      this.latestMoviePosterMessage =
        error instanceof Error ? error.message : 'No se pudo cargar la caratula.';
    }
  }

  private async fetchLatestSeriesPoster(entry: DiaryEntry): Promise<void> {
    this.seriesPosterController?.abort();
    this.seriesPosterController = new AbortController();
    this.latestSeriesPosterState = 'loading';

    try {
      const poster = await this.resolvePoster(
        entry,
        ['tvseries', 'tvminiseries', 'tvepisode'],
        this.seriesPosterController.signal,
      );
      this.latestSeriesPosterUrl = poster.url;
      this.latestSeriesPosterAlt = poster.alt;
      this.latestSeriesPosterState = 'ready';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      this.latestSeriesPosterState = 'error';
      this.latestSeriesPosterMessage =
        error instanceof Error ? error.message : 'No se pudo cargar la caratula.';
    }
  }

  private async fetchLatestAnimePoster(entry: DiaryEntry): Promise<void> {
    this.animePosterController?.abort();
    this.animePosterController = new AbortController();
    this.latestAnimePosterState = 'loading';

    try {
      const poster = await this.resolvePoster(
        entry,
        ['anime', 'tvseries', 'tvminiseries', 'movie'],
        this.animePosterController.signal,
      );
      this.latestAnimePosterUrl = poster.url;
      this.latestAnimePosterAlt = poster.alt;
      this.latestAnimePosterState = 'ready';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      this.latestAnimePosterState = 'error';
      this.latestAnimePosterMessage =
        error instanceof Error ? error.message : 'No se pudo cargar la caratula.';
    }
  }

  private async resolvePoster(
    entry: DiaryEntry,
    preferredTypes: string[],
    signal: AbortSignal,
  ): Promise<{ url: string; alt: string }> {
    const cacheKey = `${entry.type}:${entry.title.toLowerCase()}`;
    const cached = this.posterCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const searchResponse = await fetch(
      `https://api.imdbapi.dev/search/titles?query=${encodeURIComponent(entry.title)}&limit=10`,
      { signal },
    );

    if (!searchResponse.ok) {
      throw new Error(`Busqueda no valida: ${searchResponse.status}`);
    }

    const searchPayload = (await searchResponse.json()) as {
      titles?: Array<{ id?: string; type?: string; primaryTitle?: string }>;
    };

    const searchResults = searchPayload.titles ?? [];
    const normalizedPreferred = preferredTypes.map((type) => type.toLowerCase());
    const match =
      searchResults.find((title) => title.type && normalizedPreferred.includes(title.type.toLowerCase())) ??
      searchResults[0];

    if (!match?.id) {
      throw new Error('No se encontro el titulo en la busqueda.');
    }

    const imagesResponse = await fetch(
      `https://api.imdbapi.dev/titles/${match.id}/images?types=poster&pageSize=10`,
      { signal },
    );

    if (!imagesResponse.ok) {
      throw new Error(`Imagenes no validas: ${imagesResponse.status}`);
    }

    const imagesPayload = (await imagesResponse.json()) as {
      images?: Array<{ url?: string; width?: number; height?: number; type?: string }>;
    };

    const posters = imagesPayload.images ?? [];
    const poster = posters
      .filter((item) => item.url)
      .sort((a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0))[0];

    if (!poster?.url) {
      throw new Error('No se encontro caratula.');
    }

    const resolved = {
      url: poster.url,
      alt: `Caratula de ${match.primaryTitle ?? entry.title}`,
    };
    this.posterCache.set(cacheKey, resolved);
    return resolved;
  }
}
