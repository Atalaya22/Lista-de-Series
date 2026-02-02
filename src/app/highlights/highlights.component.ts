import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-highlights',
  standalone: true,
  templateUrl: './highlights.component.html',
  styleUrl: './highlights.component.css',
})
export class HighlightsComponent {
  @Input({ required: true }) items: { label: string; value: string; hint: string }[] = [];
}
