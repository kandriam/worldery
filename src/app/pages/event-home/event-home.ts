import {Component, inject} from '@angular/core';
import {EventThumbnail} from '../../thumbnail/event-thumbnail/event-thumbnail';
import {WorldEventInfo} from '../../worldevent';
import {WorldEventService} from '../../services/world-event.service';

@Component({
  selector: 'app-event-home',
  imports: [EventThumbnail],
  templateUrl: 'event-home.html',
  styleUrls: ['../pages.css', 'event-home.css', '../../../styles.css'],
})

export class EventHome {
  eventService: WorldEventService = inject(WorldEventService);
  filteredEventList: WorldEventInfo[] = [];
  worldEventList: WorldEventInfo[] = [];

  constructor() {
    this.eventService
      .getAllWorldEvents()
      .then((worldEventList: WorldEventInfo[]) => {
        this.worldEventList = worldEventList.sort((a, b) => (a.date > b.date ? 1 : -1));
        this.filteredEventList = this.worldEventList;
      });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredEventList = this.worldEventList;
      return;
    }
    
    this.filteredEventList = this.worldEventList.filter((worldEvent) =>
      worldEvent?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldEvent?.name.toLowerCase().includes(text.toLowerCase()) ||
      worldEvent?.description.toLowerCase().includes(text.toLowerCase()),
    );
  }

  addWorldEvent() {
    console.log('Adding new event');
    this.eventService.createWorldEvent('New Event', '', '', '', '', '', []);
  }
}