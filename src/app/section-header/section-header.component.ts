import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.css',
})
export class SectionHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() actionLabel?: string;
}
