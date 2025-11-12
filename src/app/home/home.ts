import {Component, inject} from '@angular/core';
import {WorldEvent} from '../word-event/world-event';
import {WorldEventInfo} from '../worldevent';
import {WorldEventService} from '../world-event.service';

@Component({
  selector: 'app-home',
  imports: [WorldEvent],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by city" #filter />
        <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
      </form>
    </section>
    <div class="home-row-title">
      <h2>Timeline</h2>
    </div>
    <div class="home-row">
      @for(worldEvent of filteredEventList; track $index) {
        <app-world-event [worldEvent]="worldEvent"></app-world-event>
      }
    </div>
  `,
  styleUrls: ['./home.css', '../../styles.css'],
})

export class Home {
  filteredEventList: WorldEventInfo[] = [];
  worldEventList: WorldEventInfo[] = [];
  worldEvent: WorldEventService = inject(WorldEventService);

  constructor() {
    this.worldEvent
      .getAllWorldEvents()
      .then((worldEventList: WorldEventInfo[]) => {
        this.worldEventList = worldEventList;
        this.filteredEventList = worldEventList;
      });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredEventList = this.worldEventList;
      return;
    }
    this.filteredEventList = this.worldEventList.filter((worldEvent) =>
      worldEvent?.tags.join(' ').toLowerCase().includes(text.toLowerCase()),
    );
  }
}
