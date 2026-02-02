import { Component, Input } from '@angular/core';

export interface PendingListItem {
  title: string;
  meta: string;
  actionLabel: string;
}

@Component({
  selector: 'app-pending-list',
  standalone: true,
  templateUrl: './pending-list.component.html',
  styleUrl: './pending-list.component.css',
})
export class PendingListComponent {
  @Input() title = 'Lista pendiente';
  @Input({ required: true }) items: PendingListItem[] = [];
}
