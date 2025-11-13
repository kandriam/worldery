import {Component, inject} from '@angular/core';
import {WorldEvent} from '../word-event/world-event';
import {WorldEventInfo} from '../worldevent';
import {WorldEventService} from '../services/world-event.service';

import { WorldLocation } from "../world-location/world-location";
import { WorldLocationInfo } from '../worldlocation';
import { WorldLocationService } from '../services/world-location.service';

@Component({
  selector: 'app-home',
  imports: [WorldEvent, WorldLocation],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by city" #filter (change)="filterResults(filter.value)"/>
        <!-- <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button> -->
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

    <div class="home-row-title">
      <h2>World</h2>
    </div>
    <div class="home-row">
      @for(worldLocation of filteredLocationList; track $index) {
        <app-world-location [worldLocation]="worldLocation"></app-world-location>
      }
    </div> 

    <div class="home-row-title">
      <h2>Characters</h2>
    </div>
    <div class="home-row">
      <!-- Character components would go here -->
    </div>

    <div class="home-row-title">
      <h2>Stories</h2>
    </div>
    <div class="home-row">
      <!-- Story components would go here -->
    </div>

    
  `,
  styleUrls: ['./home.css', '../../styles.css'],
})

export class Home {
  worldEvent: WorldEventService = inject(WorldEventService);
  filteredEventList: WorldEventInfo[] = [];
  worldEventList: WorldEventInfo[] = [];
  worldLocation: WorldLocationService = inject(WorldLocationService);
  filteredLocationList: WorldLocationInfo[] = [];
  worldLocationList: WorldLocationInfo[] = [];

  constructor() {
    this.worldEvent
      .getAllWorldEvents()
      .then((worldEventList: WorldEventInfo[]) => {
        this.worldEventList = worldEventList;
        this.filteredEventList = worldEventList;
      });

    this.worldLocation
      .getAllWorldLocations()
      .then((worldLocationList: WorldLocationInfo[]) => {
        this.worldLocationList = worldLocationList;
        this.filteredLocationList = worldLocationList;
      });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredEventList = this.worldEventList;
      this.filteredLocationList = this.worldLocationList;
      return;
    }
    this.filteredEventList = this.worldEventList.filter((worldEvent) =>
      worldEvent?.tags.join(' ').toLowerCase().includes(text.toLowerCase()),
    );
    this.filteredLocationList = this.worldLocationList.filter((worldLocation) =>
      worldLocation?.tags.join(' ').toLowerCase().includes(text.toLowerCase()),
    );
  }
}
