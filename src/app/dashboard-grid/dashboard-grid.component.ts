import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EntriesComponent } from '../entries/entries.component';
import { HighlightsComponent } from '../highlights/highlights.component';
import { MoodBoardComponent } from '../mood-board/mood-board.component';
import { PendingListComponent, PendingListItem } from '../pending-list/pending-list.component';
import { SectionHeaderComponent } from '../section-header/section-header.component';
import { DiaryEntry } from '../entries/entry-card/entry-card.component';

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [
    EntriesComponent,
    HighlightsComponent,
    MoodBoardComponent,
    PendingListComponent,
    SectionHeaderComponent,
  ],
  templateUrl: './dashboard-grid.component.html',
  styleUrl: './dashboard-grid.component.css',
})
export class DashboardGridComponent {
  @Input({ required: true }) entries: DiaryEntry[] = [];
  @Input() latestMovie: DiaryEntry | null = null;
  @Input() latestMoviePosterUrl: string | null = null;
  @Input() latestMoviePosterAlt: string = '';
  @Input() latestMoviePosterState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  @Input() latestMoviePosterMessage: string = '';
  @Input() latestSeries: DiaryEntry | null = null;
  @Input() latestSeriesPosterUrl: string | null = null;
  @Input() latestSeriesPosterAlt: string = '';
  @Input() latestSeriesPosterState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  @Input() latestSeriesPosterMessage: string = '';
  @Input() latestAnime: DiaryEntry | null = null;
  @Input() latestAnimePosterUrl: string | null = null;
  @Input() latestAnimePosterAlt: string = '';
  @Input() latestAnimePosterState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  @Input() latestAnimePosterMessage: string = '';
  @Input() highlights: Array<{ label: string; value: string; hint: string }> = [];
  @Input() moodBoard: string[] = [];
  @Input() pendingItems: PendingListItem[] = [];
  @Input() monthOptions: Array<{ value: string; label: string }> = [];
  @Input() selectedMonth = '';
  @Output() monthSelected = new EventEmitter<string>();
  @Output() pendingDiscarded = new EventEmitter<number>();

  formatEntryDate(date: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }
}
