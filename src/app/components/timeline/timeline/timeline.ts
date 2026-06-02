import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldEventInfo } from '../../../services/world-event.service';
import { TimelineEvent } from '../timeline-event/timeline-event';
import { CurrentWorldDateService } from '../../../services/current-world-date.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, TimelineEvent],
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.css', '../../../../styles.css'],
})
export class Timeline implements AfterViewInit {
  private currentWorldDateService = inject(CurrentWorldDateService);
  @Input() events!: WorldEventInfo[];
  @Input() currentEventId?: string;
  @Input() referenceDate?: string;
  @ViewChild('timelineContainer', { static: false }) timelineContainer!: ElementRef<HTMLElement>;
  @Input() title: string = 'Timeline';
  @Input() noResultsMessage: string = 'No events found';
  @Input() allowAddElement: boolean = false;
  @Input() showDisplayToggles: boolean = true;
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';
  
  @Output() addElement = new EventEmitter<void>();
  @Output() tagClicked = new EventEmitter<string>();
  
  private hasScrolledToCurrentEvent = false;
  
  // Display toggles
  showDate = true;
  showLocation = true;
  showCharacters = true;
  showStories = true;
  
  get sortedEvents(): WorldEventInfo[] {
    const sorted = [...this.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Check if we need to scroll to current event after events are loaded
    if (sorted.length > 0 && this.currentEventId && this.timelineContainer && !this.hasScrolledToCurrentEvent) {
      setTimeout(() => this.scrollToCurrentEvent(), 100);
    }
    
    return sorted;
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

  ngAfterViewInit() {
    // Try to scroll on initial load if data is already available
    setTimeout(() => {
      if (this.events.length > 0 && !this.hasScrolledToCurrentEvent) {
        if (this.currentEventId) {
          this.scrollToCurrentEvent();
        } else {
          this.scrollToNearestToCurrentDate();
        }
      }
    }, 300);
  }

  private scrollToNearestToCurrentDate() {
    if (!this.timelineContainer || this.hasScrolledToCurrentEvent) return;
    const targetTime = this.currentWorldDateService.getDate().getTime();
    const datedEvents = this.sortedEvents.filter(e => e.date);
    if (datedEvents.length === 0) return;
    const closest = datedEvents.reduce((prev, curr) =>
      Math.abs(new Date(curr.date).getTime() - targetTime) <
      Math.abs(new Date(prev.date).getTime() - targetTime) ? curr : prev
    );
    const el = this.timelineContainer.nativeElement.querySelector(`[data-event-id="${closest.id}"]`);
    if (el) {
      this.hasScrolledToCurrentEvent = true;
      const container = this.timelineContainer.nativeElement;
      const containerRect = container.getBoundingClientRect();
      const eventRect = el.getBoundingClientRect();
      container.scrollTo({
        left: container.scrollLeft + (eventRect.left - containerRect.left) - (containerRect.width / 2) + (eventRect.width / 2),
        behavior: 'smooth',
      });
    }
  }

  scrollToCurrentEvent() {
    if (!this.currentEventId || !this.timelineContainer || this.hasScrolledToCurrentEvent) {
      return;
    }

    const timelineElement = this.timelineContainer.nativeElement;
    const currentEventElement = timelineElement.querySelector(`[data-event-id="${this.currentEventId}"]`);
    
    if (currentEventElement) {
      this.hasScrolledToCurrentEvent = true;
      
      const containerRect = timelineElement.getBoundingClientRect();
      const eventRect = currentEventElement.getBoundingClientRect();
      
      // Calculate the scroll position to center the current event
      const scrollPosition = timelineElement.scrollLeft + 
                           (eventRect.left - containerRect.left) - 
                           (containerRect.width / 2) + 
                           (eventRect.width / 2);
      
      // Smooth scroll to the calculated position
      timelineElement.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }
}