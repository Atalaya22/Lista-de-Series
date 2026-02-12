import { Component, EventEmitter, Input, Output } from '@angular/core';

// Vistas posibles que maneja el topbar.
export type TopbarView = 'diario' | 'estadisticas';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  // Vista activa para marcar el boton seleccionado.
  @Input() activeView: TopbarView = 'diario';
  // Evento para avisar al padre que se cambio de vista.
  @Output() viewChanged = new EventEmitter<TopbarView>();

  // Emite la nueva vista elegida desde la barra superior.
  selectView(view: TopbarView): void {
    this.viewChanged.emit(view);
  }
}
