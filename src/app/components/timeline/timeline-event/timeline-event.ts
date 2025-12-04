import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorldEventInfo } from '../../../worldevent';

@Component({
  selector: 'app-timeline-event',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './timeline-event.html',
  styleUrls: ['./timeline-event.css']
})
export class TimelineEvent {
  event = input.required<WorldEventInfo>();
  index = input.required<number>();
  currentEventId = input<string | undefined>();
  showDate = input<boolean>(true);
  showLocation = input<boolean>(true);
  showCharacters = input<boolean>(true);
  showStories = input<boolean>(true);
  shouldShowYear = input<boolean>(false);
  
  tagClicked = output<string>();
  
  onTagClick(tag: string) {
    this.tagClicked.emit(tag);
  }
  
  formatDate(dateString: string): string {
    // Parse YYYY-MM-DD format to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day); // month is 0-based in JS Date
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  getYear(dateString: string): string {
    const [year] = dateString.split('-').map(num => parseInt(num, 10));
    return year.toString();
  }
  
  isCurrentEvent(): boolean {
    return this.currentEventId() === this.event().id.toString();
  }
}