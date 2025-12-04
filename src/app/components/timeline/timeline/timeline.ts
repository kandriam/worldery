import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldEventInfo } from '../../../worldevent';
import { TimelineEvent } from '../timeline-event/timeline-event';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, TimelineEvent],
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.css', '../../../../styles.css'],
})
export class Timeline {
  @Input() events!: WorldEventInfo[];
  @Input() title: string = 'Timeline';
  @Input() noResultsMessage: string = 'No events found';
  
  @Output() addElement = new EventEmitter<void>();
  @Output() tagClicked = new EventEmitter<string>();
  
  // Display toggles
  showDate = true;
  showLocation = true;
  showCharacters = true;
  showStories = true;
  
  get sortedEvents(): WorldEventInfo[] {
    return [...this.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  onAddElement() {
    this.addElement.emit();
  }
  
  onTagClick(tag: string) {
    this.tagClicked.emit(tag);
  }
  
  toggleDate() {
    this.showDate = !this.showDate;
  }
  
  toggleLocation() {
    this.showLocation = !this.showLocation;
  }
  
  toggleCharacters() {
    this.showCharacters = !this.showCharacters;
  }
  
  toggleStories() {
    this.showStories = !this.showStories;
  }
  
  shouldShowYearMarker(event: WorldEventInfo, index: number): boolean {
    if (index === 0) return true;
    const currentYear = new Date(event.date).getFullYear();
    const previousYear = new Date(this.sortedEvents[index - 1].date).getFullYear();
    return currentYear !== previousYear;
  }
}