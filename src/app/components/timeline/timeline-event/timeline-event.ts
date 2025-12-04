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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  getYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }
}