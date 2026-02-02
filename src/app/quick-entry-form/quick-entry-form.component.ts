import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiaryEntry } from '../entries/entry-card/entry-card.component';

@Component({
  selector: 'app-quick-entry-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './quick-entry-form.component.html',
  styleUrl: './quick-entry-form.component.css',
})
export class QuickEntryFormComponent {
  @Output() entrySaved = new EventEmitter<DiaryEntry>();

  title: string = '';
  type: DiaryEntry['type'] = 'Pelicula';
  rating: string = '';
  notes: string = '';
  mood: string = '';
  tags: string = '';

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
    this.title = '';
    this.type = 'Pelicula';
    this.rating = '';
    this.notes = '';
    this.mood = '';
    this.tags = '';
  }
}
