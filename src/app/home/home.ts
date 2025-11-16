import {Component, inject} from '@angular/core';
import {WorldEvent} from './world-event/world-event';
import {WorldEventInfo} from '../worldevent';
import {WorldEventService} from '../services/world-event.service';

import { WorldLocation } from "./world-location/world-location";
import { WorldLocationInfo } from '../worldlocation';
import { WorldLocationService } from '../services/world-location.service';

import { WorldCharacter } from './world-character/world-character';
import { WorldCharacterInfo } from '../worldcharacter';
import { WorldCharacterService } from '../services/world-character.service';

import { WorldStory } from './world-story/world-story';
import { WorldStoryInfo } from '../worldstory';
import { WorldStoryService } from '../services/world-story.service';

@Component({
  selector: 'app-home',
  imports: [WorldEvent, WorldLocation, WorldCharacter, WorldStory],
  templateUrl: 'home.html',
  styleUrls: ['./home.css', '../../styles.css'],
})

export class Home {
  eventService: WorldEventService = inject(WorldEventService);
  filteredEventList: WorldEventInfo[] = [];
  worldEventList: WorldEventInfo[] = [];

  locationService: WorldLocationService = inject(WorldLocationService);
  filteredLocationList: WorldLocationInfo[] = [];
  worldLocationList: WorldLocationInfo[] = [];

  characterService: WorldCharacterService = inject(WorldCharacterService);
  filteredCharacterList: WorldCharacterInfo[] = []
  worldCharacterList: WorldCharacterInfo[] = [];

  storyService: WorldStoryService = inject(WorldStoryService);
  worldStoryList: WorldStoryInfo[] = [];
  filteredStoryList: WorldStoryInfo[] = [];

  constructor() {
    this.eventService
      .getAllWorldEvents()
      .then((worldEventList: WorldEventInfo[]) => {
        this.worldEventList = worldEventList.sort((a, b) => (a.date > b.date ? 1 : -1));
        this.filteredEventList = this.worldEventList;
      });

    this.locationService
      .getAllWorldLocations()
      .then((worldLocationList: WorldLocationInfo[]) => {
        this.worldLocationList = worldLocationList;
        this.filteredLocationList = worldLocationList;
      });
    
      this.characterService
      .getAllWorldCharacters()
      .then((worldCharacterList: WorldCharacterInfo[]) => {
        this.worldCharacterList = worldCharacterList;
        this.filteredCharacterList = worldCharacterList;
      });

    this.storyService
      .getAllWorldStories()
      .then((worldStoryList: WorldStoryInfo[]) => {
        this.worldStoryList = worldStoryList;
        this.filteredStoryList = worldStoryList;
      });
  }

  filterResults(text: string) {
    let searchItems = text.split(' ').map(item => item.trim()).filter(item => item.length > 0);
    
    if (!text) {
      this.filteredEventList = this.worldEventList;
      this.filteredLocationList = this.worldLocationList;
      this.filteredCharacterList = this.worldCharacterList;
      return;
    }

    for (let item of searchItems) {
      console.log('Searching for:', item);
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
      worldCharacter?.lastName.toLowerCase().includes(text.toLowerCase()) ||
      worldCharacter?.altNames.join(' ').toLowerCase().includes(text.toLowerCase())
    );
    this.filteredStoryList = this.worldStoryList.filter((worldStory) =>
      worldStory?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldStory?.title.toLowerCase().includes(text.toLowerCase()) ||
      worldStory?.description.toLowerCase().includes(text.toLowerCase()),
    ); 
    
  }

  addWorldElement(elementType: string) {
    console.log('Add world element clicked:', elementType);
    if (elementType === 'event') {
      console.log('Adding new event');
      this.eventService.createWorldEvent('New Event', '', '', '', '', '', []);
    }
    else if (elementType === 'location') {
      console.log('Adding new location');
      // Logic to add a new location
      this.locationService.createWorldLocation('New Location', '', [], [], []);
    }
    else if (elementType === 'character') {
      console.log('Adding new character');
      // Logic to add a new character
      this.characterService.createWorldCharacter('New Character', '', [], '', '', [], [], [], '', '', [], []);
    }
    else if (elementType === 'story') {
      console.log('Adding new story');
      // Logic to add a new story
      this.storyService.createWorldStory('New Story', '', [], [], []);
    }
    // window.location.reload();
  }
}
