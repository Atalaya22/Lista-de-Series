import { Component, EventEmitter, Input, Output } from '@angular/core';

// Modelo minimo para la lista de pendientes.
export interface PendingListItem {
  title: string;
}

@Component({
  selector: 'app-pending-list',
  standalone: true,
  templateUrl: './pending-list.component.html',
  styleUrl: './pending-list.component.css',
})
export class PendingListComponent {
  // Encabezado del bloque.
  @Input() title = 'Lista pendiente';
  // Items pendientes a renderizar.
  @Input({ required: true }) items: PendingListItem[] = [];
  // Emite el indice del item descartado.
  @Output() discard = new EventEmitter<number>();
}
