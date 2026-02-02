import { Component, Input } from '@angular/core';

export interface DiaryEntry {
  id: number;
  title: string;
  type: 'Pelicula' | 'Serie' | 'Anime';
  imdbId?: string;
  season?: string;
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
  @Input({ required: true }) entry!: DiaryEntry;
}
