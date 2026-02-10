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
  @Input({ required: true }) title = '';
  @Input() monthOptions: Array<{ value: string; label: string }> = [];
  @Input() selectedMonth = '';
  @Output() monthSelected = new EventEmitter<string>();

  onMonthSelected(value: string): void {
    this.monthSelected.emit(value);
  }
}
