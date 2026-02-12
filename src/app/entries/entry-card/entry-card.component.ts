import { Component, Input } from '@angular/core';

// Modelo central del proyecto: representa una entrada del diario audiovisual.
export interface DiaryEntry {
  id: number;
  title: string;
  type: 'Pelicula' | 'Serie' | 'Anime';
  season?: string;
  place?: string;
  date: string;
  rating: number;
  mood: string;
  tags: string[];
  notes: string;
}

@Component({
  selector: 'app-entry-card',
  standalone: true,
  templateUrl: './entry-card.component.html',
  styleUrl: './entry-card.component.css',
})
export class EntryCardComponent {
  // Entrada puntual que se mostrara en la tarjeta.
  @Input({ required: true }) entry!: DiaryEntry;
}
