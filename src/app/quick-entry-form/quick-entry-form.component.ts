import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiaryEntry } from '../entries/entry-card/entry-card.component';
import { PendingListItem } from '../pending-list/pending-list.component';

@Component({
  selector: 'app-quick-entry-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './quick-entry-form.component.html',
  styleUrl: './quick-entry-form.component.css',
})
export class QuickEntryFormComponent {
  @Output() entrySaved = new EventEmitter<DiaryEntry>();
  @Output() pendingSaved = new EventEmitter<PendingListItem>();

  title: string = '';
  type: DiaryEntry['type'] = 'Pelicula';
  rating: string = '';
  notes: string = '';
  mood: string = '';
  tags: string = '';
  isPending: boolean = false;

  readonly todayLabel: string = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  saveEntry(): void {
    const title = this.title.trim();
    const notes = this.notes.trim();
    const mood = this.mood.trim();
    const tags = this.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const ratingValue = Number.parseFloat(this.rating);
    const safeRating = Number.isFinite(ratingValue)
      ? Math.min(Math.max(ratingValue, 0), 5)
      : 0;

    if (!title) {
      return;
    }

    if (this.isPending) {
      const meta = notes ? `${this.type} • ${notes}` : `${this.type} • Pendiente`;
      const pendingItem: PendingListItem = {
        title,
        meta,
        actionLabel: 'Agregar',
      };
      this.pendingSaved.emit(pendingItem);
      this.resetForm();
      return;
    }

    const today = new Date();
    const entry: DiaryEntry = {
      id: today.getTime(),
      title,
      type: this.type,
      date: today.toISOString().split('T')[0],
      rating: safeRating,
      mood: mood || 'Pendiente',
      tags: tags.length > 0 ? tags : ['Entrada rapida'],
      notes: notes || 'Sin nota rapida.',
    };

    this.entrySaved.emit(entry);
    this.resetForm();
  }

  private resetForm(): void {
    this.title = '';
    this.type = 'Pelicula';
    this.rating = '';
    this.notes = '';
    this.mood = '';
    this.tags = '';
    this.isPending = false;
  }
}
