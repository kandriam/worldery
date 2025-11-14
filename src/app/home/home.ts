import {Component, inject} from '@angular/core';
import {WorldEvent} from '../word-event/world-event';
import {WorldEventInfo} from '../worldevent';
import {WorldEventService} from '../services/world-event.service';

import { WorldLocation } from "../world-location/world-location";
import { WorldLocationInfo } from '../worldlocation';
import { WorldLocationService } from '../services/world-location.service';

import { WorldCharacter } from '../world-character/world-character';
import { WorldCharacterInfo } from '../worldcharacter';
import { WorldCharacterService } from '../services/world-character.service';

import { WorldStory } from '../world-story/world-story';
import { WorldStoryInfo } from '../worldstory';
import { WorldStoryService } from '../services/world-story.service';

@Component({
  selector: 'app-home',
  imports: [WorldEvent, WorldLocation, WorldCharacter, WorldStory],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Search" #filter (input)="filterResults(filter.value)"/>
        <!-- <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button> -->
      </form>
    </section>
    <div class="home-row-title">
      <h2>Timeline</h2>
      <button class="primary">Add Event</button>
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
     @for(worldCharacter of filteredCharacterList; track $index) {
        <app-world-character [worldCharacter]="worldCharacter"></app-world-character>
      }
    </div>

    <div class="home-row-title">
      <h2>Stories</h2>
    </div>
    <div class="home-row">
      <!-- Story components would go here -->
      @for(worldStory of filteredStoryList; track $index) {
        <app-world-story [worldStory]="worldStory"></app-world-story>
      }
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

  worldCharacter: WorldCharacterService = inject(WorldCharacterService);
  filteredCharacterList: WorldCharacterInfo[] = []
  worldCharacterList: WorldCharacterInfo[] = [];

  worldStory: WorldStoryService = inject(WorldStoryService);
  worldStoryList: WorldStoryInfo[] = [];
  filteredStoryList: WorldStoryInfo[] = [];

  constructor() {
    this.worldEvent
      .getAllWorldEvents()
      .then((worldEventList: WorldEventInfo[]) => {
        this.worldEventList = worldEventList.sort((a, b) => (a.date > b.date ? 1 : -1));
        this.filteredEventList = this.worldEventList;
      });

    this.worldLocation
      .getAllWorldLocations()
      .then((worldLocationList: WorldLocationInfo[]) => {
        this.worldLocationList = worldLocationList;
        this.filteredLocationList = worldLocationList;
      });
    
      this.worldCharacter
      .getAllWorldCharacters()
      .then((worldCharacterList: WorldCharacterInfo[]) => {
        this.worldCharacterList = worldCharacterList;
        this.filteredCharacterList = worldCharacterList;
      });

    this.worldStory
      .getAllWorldStories()
      .then((worldStoryList: WorldStoryInfo[]) => {
        this.worldStoryList = worldStoryList;
        this.filteredStoryList = worldStoryList;
      });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredEventList = this.worldEventList;
      this.filteredLocationList = this.worldLocationList;
      this.filteredCharacterList = this.worldCharacterList;
      return;
    }
    this.filteredEventList = this.worldEventList.filter((worldEvent) =>
      worldEvent?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldEvent?.name.toLowerCase().includes(text.toLowerCase()) ||
      worldEvent?.description.toLowerCase().includes(text.toLowerCase()),
    );
    this.filteredLocationList = this.worldLocationList.filter((worldLocation) =>
      worldLocation?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldLocation?.name.toLowerCase().includes(text.toLowerCase()) ||
      worldLocation?.description.toLowerCase().includes(text.toLowerCase()) ,
    );
    this.filteredCharacterList = this.worldCharacterList.filter((worldCharacter) =>
      worldCharacter?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldCharacter?.firstName.toLowerCase().includes(text.toLowerCase()) ||
      worldCharacter?.lastName.toLowerCase().includes(text.toLowerCase())
    );
    this.filteredStoryList = this.worldStoryList.filter((worldStory) =>
      worldStory?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldStory?.title.toLowerCase().includes(text.toLowerCase()) ||
      worldStory?.description.toLowerCase().includes(text.toLowerCase()),
    ); 
  }
}
