import {Component, inject, input, output} from '@angular/core';
import {WorldEventInfo} from '../../../worldevent';
import {RouterLink } from '@angular/router';
import { WorldEventService } from '../../../services/world-event.service';

@Component({
  selector: 'app-event-thumbnail',
  imports: [RouterLink],
  templateUrl: 'event-thumbnail.html',
  styleUrls: ['event-thumbnail.css', '../thumbnail.css'],
})

export class EventThumbnail {
  worldEvent = input.required<WorldEventInfo>();
  showDate = input<boolean>(true);
  showLocation = input<boolean>(true);
  showCharacters = input<boolean>(true);
  showStories = input<boolean>(true);
  worldEventService = inject(WorldEventService);
  
  tagClicked = output<string>();

  deleteEvent(id: number, event: Event) {
    event.stopPropagation();
    console.log(`Delete event with ID: ${id}`);
    this.worldEventService.deleteWorldEvent(id);
  }
  
  onTagClick(tag: string, event: Event) {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
}
