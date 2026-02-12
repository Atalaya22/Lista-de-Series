import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TopbarView = 'diario' | 'estadisticas';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  @Input() activeView: TopbarView = 'diario';
  @Output() viewChanged = new EventEmitter<TopbarView>();

  selectView(view: TopbarView): void {
    this.viewChanged.emit(view);
  }
}
