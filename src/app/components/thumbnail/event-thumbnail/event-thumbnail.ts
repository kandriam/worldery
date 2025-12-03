import {Component, inject, input} from '@angular/core';
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
  worldEventService = inject(WorldEventService);

  deleteEvent(id: number, event: Event) {
    event.stopPropagation();
    console.log(`Delete event with ID: ${id}`);
    this.worldEventService.deleteWorldEvent(id);
  }
}
