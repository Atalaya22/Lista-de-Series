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
  // Evento cuando la entrada va al backend.
  @Output() entrySaved = new EventEmitter<DiaryEntry>();
  // Evento cuando se guarda como "pendiente" local.
  @Output() pendingSaved = new EventEmitter<PendingListItem>();

  // Catlogos para selects del formulario.
  readonly moodOptions: string[] = [
    'Euforica',
    'Feliz',
    'Inspirada',
    'Nostalgica',
    'Agridulce',
    'Tensa',
    'Catartica',
    'Triste',
  ];
  readonly placeOptions: string[] = [
    'Sala de casa',
    'Cine',
    'Cuarto',
    'Casa de un amigo',
    'Transporte',
    'Otro',
  ];

  // Estado de campos del formulario.
  title: string = '';
  type: DiaryEntry['type'] = 'Pelicula';
  rating: string = '';
  notes: string = '';
  place: string = this.placeOptions[0];
  mood: string = this.moodOptions[3];
  tags: string = '';
  isPending: boolean = false;

  // Fecha actual ya formateada para mostrar en el encabezado.
  readonly todayLabel: string = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  // Construye y emite una entrada nueva (persistida o pendiente).
  saveEntry(): void {
    const title = this.title.trim();
    const notes = this.notes.trim();
    const place = this.place.trim();
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
      const pendingItem: PendingListItem = {
        title,
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
      place: place || 'Sin lugar',
      mood: mood || 'Pendiente',
      tags: tags.length > 0 ? tags : ['Entrada rapida'],
      notes: notes || 'Sin nota rapida.',
    };

    this.entrySaved.emit(entry);
    this.resetForm();
  }

  // Limpia el formulario para una nueva captura.
  private resetForm(): void {
    this.title = '';
    this.type = 'Pelicula';
    this.rating = '';
    this.notes = '';
    this.place = this.placeOptions[0];
    this.mood = this.moodOptions[3];
    this.tags = '';
    this.isPending = false;
  }
}
