import { Component, Input } from '@angular/core';
import { SectionHeaderComponent } from '../section-header/section-header.component';
import { DiaryEntry, EntryCardComponent } from './entry-card/entry-card.component';

@Component({
  selector: 'app-entries',
  standalone: true,
  imports: [SectionHeaderComponent, EntryCardComponent],
  templateUrl: './entries.component.html',
  styleUrl: './entries.component.css',
})
export class EntriesComponent {
  @Input({ required: true }) entries: DiaryEntry[] = [];
}
