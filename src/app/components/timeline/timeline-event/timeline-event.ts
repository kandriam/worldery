import { Component, input, output, inject } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorldEventInfo } from '../../../worldevent';

@Component({
  selector: 'app-timeline-event',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './timeline-event.html',
  styleUrls: ['./timeline-event.css', '../../../../styles.css']
})
export class TimelineEvent {
    settingsService = inject(SettingsService);
  event = input.required<WorldEventInfo>();
  index = input.required<number>();
  currentEventId = input<string | undefined>();
  showDate = input<boolean>(true);
  showLocation = input<boolean>(true);
  showCharacters = input<boolean>(true);
  showStories = input<boolean>(true);
  shouldShowYear = input<boolean>(false);
  orientation = input<'horizontal' | 'vertical'>('vertical');
  
  tagClicked = output<string>();
  
  onTagClick(tag: string) {
    this.tagClicked.emit(tag);
  }
  
  formatDate(dateString: string): string {
    return this.settingsService.formatDate(dateString);
  }
  
  formatDateRange(): string {
    const event = this.event();
    const startDate = this.formatDate(event.date);
    if (event.endDate) {
      const endDate = this.formatDate(event.endDate);
      if (event.date === event.endDate) {
        return startDate; // Same day, show only once
      }
      return `${startDate} - ${endDate}`;
    }
    return startDate;
  }
  
  getYear(dateString: string): string {
    const [year] = dateString.split('-').map(num => parseInt(num, 10));
    return year.toString();
  }
  
  isCurrentEvent(): boolean {
    return this.currentEventId() === this.event().id.toString();
  }
}