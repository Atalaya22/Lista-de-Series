import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.css',
})
export class SectionHeaderComponent {
  // Titulo visible de cada seccion.
  @Input({ required: true }) title = '';
  // Opciones del selector de mes (si aplica).
  @Input() monthOptions: Array<{ value: string; label: string }> = [];
  // Mes seleccionado actualmente.
  @Input() selectedMonth = '';
  // Emite cambio de mes al componente padre.
  @Output() monthSelected = new EventEmitter<string>();

  // Reenvia el cambio de select al padre.
  onMonthSelected(value: string): void {
    this.monthSelected.emit(value);
  }
}
