import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldEventInfo } from '../../../services/world-event.service';
import { TimelineEvent } from '../timeline-event/timeline-event';
import { CurrentWorldDateService } from '../../../services/current-world-date.service';

export interface EventGroup {
  date: string;
  events: WorldEventInfo[];
}

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
  @Input() allEvents?: WorldEventInfo[];
  @Input() currentEventId?: string;
  @Input() referenceDate?: string;
  @ViewChild('timelineContainer', { static: false }) timelineContainer!: ElementRef<HTMLElement>;
  @ViewChild('timelineContent', { static: false }) timelineContentRef!: ElementRef<HTMLElement>;
  @Input() title: string = 'Timeline';
  @Input() noResultsMessage: string = 'No events found';
  @Input() allowAddElement: boolean = false;
  @Input() showDisplayToggles: boolean = true;
  @Input() showFilterToggles: boolean = false;
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';
  
  @Output() addElement = new EventEmitter<void>();
  @Output() tagClicked = new EventEmitter<string>();
  
  private hasScrolledToCurrentEvent = false;
  
  // Display toggles
  showDate = true;
  showLocation = true;
  showCharacters = true;
  showStories = true;

  // Filter toggles
  showGhostEvents: boolean = true;
  showAllEvents: boolean = false;

  get visibleEvents(): WorldEventInfo[] {
    const base = (this.showAllEvents && this.allEvents) ? this.allEvents : this.events;
    return this.showGhostEvents ? base : base.filter(e => !e.isGhost);
  }
  
  get groupedSortedEvents(): EventGroup[] {
    const sorted = [...this.visibleEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Trigger scroll-to-current after events load
    if (sorted.length > 0 && !this.hasScrolledToCurrentEvent) {
      if (this.currentEventId && this.timelineContainer) {
        setTimeout(() => this.scrollToCurrentEvent(), 100);
      } else if (this.timelineContainer) {
        setTimeout(() => this.scrollToNearestToCurrentDate(), 100);
      }
    }

    const groups: EventGroup[] = [];
    for (const event of sorted) {
      const last = groups[groups.length - 1];
      if (last && last.date === event.date) {
        last.events.push(event);
      } else {
        groups.push({ date: event.date, events: [event] });
      }
    }
    return groups;
  }

  shouldShowYearMarkerForGroup(group: EventGroup, index: number): boolean {
    if (index === 0) return true;
    const currentYear = new Date(group.date).getFullYear();
    const previousYear = new Date(this.groupedSortedEvents[index - 1].date).getFullYear();
    return currentYear !== previousYear;
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
    // Kept for compatibility; prefer shouldShowYearMarkerForGroup
    if (index === 0) return true;
    const groups = this.groupedSortedEvents;
    const currentYear = new Date(event.date).getFullYear();
    const previousYear = index > 0 ? new Date(groups[index - 1]?.date ?? event.date).getFullYear() : currentYear;
    return currentYear !== previousYear;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.visibleEvents.length > 0 && !this.hasScrolledToCurrentEvent) {
        if (this.currentEventId) {
          this.scrollToCurrentEvent();
        } else {
          this.scrollToNearestToCurrentDate();
        }
      }
    }, 300);
  }

  private getScrollContainer(): ElementRef<HTMLElement> | null {
    return this.orientation === 'vertical' ? (this.timelineContentRef ?? null) : (this.timelineContainer ?? null);
  }

  private scrollToNearestToCurrentDate() {
    if (this.hasScrolledToCurrentEvent) return;
    const targetTime = this.currentWorldDateService.getDate().getTime();
    const allVisible = this.groupedSortedEvents.flatMap(g => g.events).filter(e => e.date);
    if (allVisible.length === 0) return;
    const closest = allVisible.reduce((prev, curr) =>
      Math.abs(new Date(curr.date).getTime() - targetTime) <
      Math.abs(new Date(prev.date).getTime() - targetTime) ? curr : prev
    );
    this.scrollToEventId(closest.id.toString());
  }

  scrollToCurrentEvent() {
    if (!this.currentEventId || this.hasScrolledToCurrentEvent) return;
    this.scrollToEventId(this.currentEventId);
  }

  private scrollToEventId(eventId: string) {
    const isVertical = this.orientation === 'vertical';
    const scrollRef = this.getScrollContainer();
    if (!scrollRef) return;
    const containerEl = scrollRef.nativeElement;
    const eventEl = containerEl.querySelector(`[data-event-id="${eventId}"]`) as HTMLElement | null;
    if (!eventEl) return;
    this.hasScrolledToCurrentEvent = true;
    const containerRect = containerEl.getBoundingClientRect();
    const eventRect = eventEl.getBoundingClientRect();
    if (isVertical) {
      containerEl.scrollTo({
        top: containerEl.scrollTop + (eventRect.top - containerRect.top) - (containerRect.height / 2) + (eventRect.height / 2),
        behavior: 'smooth',
      });
    } else {
      containerEl.scrollTo({
        left: containerEl.scrollLeft + (eventRect.left - containerRect.left) - (containerRect.width / 2) + (eventRect.width / 2),
        behavior: 'smooth',
      });
    }
  }
}