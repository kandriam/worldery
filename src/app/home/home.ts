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
  templateUrl: 'home.html',
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
