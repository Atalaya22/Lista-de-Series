import { Component } from '@angular/core';
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
export class App {
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
  }
}
