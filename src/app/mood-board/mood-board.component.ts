import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mood-board',
  standalone: true,
  templateUrl: './mood-board.component.html',
  styleUrl: './mood-board.component.css',
})
export class MoodBoardComponent {
  // Titulo del bloque visual de emociones.
  @Input() title = 'Mapa de emociones';
  // Lista de emociones ya agregadas con porcentaje.
  @Input({ required: true }) moods: string[] = [];
}
