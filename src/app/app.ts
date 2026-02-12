import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PendingListItem } from './pending-list/pending-list.component';
import { DiaryEntry } from './entries/entry-card/entry-card.component';
import { QuickEntryFormComponent } from './quick-entry-form/quick-entry-form.component';
import { TopbarComponent } from './topbar/topbar.component';
import { DashboardGridComponent } from './dashboard-grid/dashboard-grid.component';
import { MultimediaApiService } from './services/multimedia-api.service';
import { TopbarView } from './topbar/topbar.component';
import { WeeklyMoviesChartComponent } from './weekly-movies-chart/weekly-movies-chart.component';

interface Highlight {
  label: string;
  value: string;
  hint: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    QuickEntryFormComponent,
    TopbarComponent,
    DashboardGridComponent,
    WeeklyMoviesChartComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  activeView: TopbarView = 'diario';
  private summaryMonthKey: string | null = null;
  isLoadingEntries = false;
  entriesErrorMessage = '';

  entries: DiaryEntry[] = [];

  get highlights(): Highlight[] {
    if (this.entries.length === 0) {
      return [
        {
          label: 'Items vistos',
          value: '0',
          hint: 'Sin registros',
        },
        {
          label: 'Estado de animo',
          value: 'Sin datos',
          hint: 'Sin entradas este mes',
        },
        {
          label: 'Lugar favorito',
          value: 'Sin datos',
          hint: 'Sin entradas este mes',
        },
      ];
    }

    const monthKeys = this.summaryMonthOptions.map((option) => option.value);
    const selectedMonthKey =
      this.summaryMonthKey && monthKeys.includes(this.summaryMonthKey) ? this.summaryMonthKey : monthKeys[0];
    const [year, month] = selectedMonthKey.split('-').map(Number);
    const monthDate = new Date(year, month - 1, 1);
    const monthlyEntries = this.entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === month - 1 && entryDate.getFullYear() === year;
    });
    const monthlyItems = monthlyEntries.length;

    const moodCounts = new Map<string, number>();
    const placeCounts = new Map<string, number>();
    for (const entry of monthlyEntries) {
      moodCounts.set(entry.mood, (moodCounts.get(entry.mood) ?? 0) + 1);
      const place = entry.place?.trim() || 'Sin lugar';
      placeCounts.set(place, (placeCounts.get(place) ?? 0) + 1);
    }

    const [topMood = 'Sin datos', topMoodCount = 0] = Array.from(moodCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0] ?? [];
    const [topPlace = 'Sin datos', topPlaceCount = 0] = Array.from(placeCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0] ?? [];
    const topMoodPercent = monthlyItems > 0 ? Math.round((topMoodCount / monthlyItems) * 100) : 0;
    const topPlacePercent = monthlyItems > 0 ? Math.round((topPlaceCount / monthlyItems) * 100) : 0;

    return [
      {
        label: 'Items vistos',
        value: `${monthlyItems}`,
        hint: `En ${new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(monthDate)}`,
      },
      {
        label: 'Estado de animo',
        value: topMood,
        hint: monthlyItems > 0 ? `Tema dominante • ${topMoodPercent}% del mes` : 'Sin entradas este mes',
      },
      {
        label: 'Lugar favorito',
        value: topPlace,
        hint: monthlyItems > 0 ? `${topPlacePercent}% de tus entradas` : 'Sin entradas este mes',
      },
    ];
  }

  moodBoard: string[] = this.buildMoodBoard(this.entries);

  pendingItems: PendingListItem[] = [];

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

  constructor(private readonly multimediaApi: MultimediaApiService) {}

  ngOnInit(): void {
    void this.loadEntries();
  }

  get moviesCount(): number {
    return this.entries.filter((entry) => entry.type === 'Pelicula').length;
  }

  get seriesCount(): number {
    return this.entries.filter((entry) => entry.type === 'Serie').length;
  }

  get averageRating(): number {
    if (this.entries.length === 0) {
      return 0;
    }
    const total = this.entries.reduce((sum, entry) => sum + entry.rating, 0);
    return total / this.entries.length;
  }

  get summaryMonthOptions(): Array<{ value: string; label: string }> {
    const year = this.getSummaryYear();
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDate = new Date(year, monthIndex, 1);
      return {
        value: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
        label: formatter.format(monthDate),
      };
    });
  }

  get selectedSummaryMonth(): string {
    return this.summaryMonthKey ?? this.summaryMonthOptions[0]?.value ?? '';
  }

  async addEntry(entry: DiaryEntry): Promise<void> {
    try {
      const createdEntry = await this.multimediaApi.createEntry(entry);
      this.entries = [createdEntry, ...this.entries];
      this.entriesErrorMessage = '';
      this.syncDashboardState(createdEntry);
    } catch (error) {
      this.entriesErrorMessage = this.getApiErrorMessage(error, 'No se pudo guardar en la base de datos.');
    }
  }

  addPendingItem(item: PendingListItem): void {
    this.pendingItems = [item, ...this.pendingItems];
  }

  discardPendingItem(index: number): void {
    this.pendingItems = this.pendingItems.filter((_, itemIndex) => itemIndex !== index);
  }

  setSummaryMonth(monthKey: string): void {
    this.summaryMonthKey = monthKey;
  }

  setActiveView(view: TopbarView): void {
    this.activeView = view;
  }

  formatEntryDate(date: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  private async loadEntries(): Promise<void> {
    this.isLoadingEntries = true;
    try {
      this.entries = await this.multimediaApi.listEntries();
      this.entriesErrorMessage = '';
    } catch (error) {
      this.entriesErrorMessage = this.getApiErrorMessage(
        error,
        'No se pudieron cargar las entradas desde la API.',
      );
      this.entries = [];
    } finally {
      this.isLoadingEntries = false;
      this.syncDashboardState();
    }
  }

  private getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error?.message === 'string' && error.error.message.trim().length > 0) {
        return error.error.message;
      }
      return error.message || fallback;
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return fallback;
  }

  private syncDashboardState(latestNewEntry?: DiaryEntry): void {
    this.syncSummaryMonthSelection();
    this.moodBoard = this.buildMoodBoard(this.entries);

    if (!latestNewEntry) {
      this.refreshLatestMovie();
      this.refreshLatestSeries();
      this.refreshLatestAnime();
      return;
    }

    if (latestNewEntry.type === 'Pelicula') {
      this.refreshLatestMovie();
      return;
    }

    if (latestNewEntry.type === 'Serie') {
      this.refreshLatestSeries();
      return;
    }

    this.refreshLatestAnime();
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

  private buildMoodBoard(entries: DiaryEntry[]): string[] {
    if (entries.length === 0) {
      return [];
    }

    const moodCounts = new Map<string, number>();
    for (const entry of entries) {
      moodCounts.set(entry.mood, (moodCounts.get(entry.mood) ?? 0) + 1);
    }

    return Array.from(moodCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([mood, count]) => `${mood} ${Math.round((count / entries.length) * 100)}%`);
  }

  private getSummaryYear(): number {
    if (this.entries.length === 0) {
      return new Date().getFullYear();
    }

    const latestEntry = this.entries.reduce((latest, entry) =>
      new Date(entry.date) > new Date(latest.date) ? entry : latest,
    );
    return new Date(latestEntry.date).getFullYear();
  }

  private syncSummaryMonthSelection(): void {
    const monthKeys = this.summaryMonthOptions.map((option) => option.value);
    if (monthKeys.length === 0) {
      this.summaryMonthKey = null;
      return;
    }

    if (!this.summaryMonthKey || !monthKeys.includes(this.summaryMonthKey)) {
      this.summaryMonthKey = monthKeys[0];
    }
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
