import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mood-board',
  standalone: true,
  templateUrl: './mood-board.component.html',
  styleUrl: './mood-board.component.css',
})
export class MoodBoardComponent {
  @Input() title = 'Mapa de emociones';
  @Input({ required: true }) moods: string[] = [];
}
