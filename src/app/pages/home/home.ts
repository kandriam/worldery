import {Component, inject, ViewChild} from '@angular/core';
import {WorldEventInfo} from '../../worldevent';
import {WorldEventService} from '../../services/world-event.service';

import { WorldLocationInfo } from '../../worldlocation';
import { WorldLocationService } from '../../services/world-location.service';

import { WorldCharacterInfo } from '../../worldcharacter';
import { WorldCharacterService } from '../../services/world-character.service';

import { WorldStoryInfo } from '../../worldstory';
import { WorldStoryService } from '../../services/world-story.service';
import {SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../../components/search-filter/search-filter';
import {HomeRow, EntityType} from '../../components/home-row/home-row';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [SearchFilter, HomeRow],
  templateUrl: 'home.html',
  styleUrls: ['./home.css', '../pages.css', '../../../styles.css'],
})

export class Home {
  @ViewChild(SearchFilter) searchFilter!: SearchFilter;
  
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

  router: Router = inject(Router);

  // All entities for filter dropdowns
  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  
  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: true
  };

  constructor() {
    // Load all data for both display and filtering
    Promise.all([
      this.eventService.getAllWorldEvents(),
      this.locationService.getAllWorldLocations(), 
      this.characterService.getAllWorldCharacters(),
      this.storyService.getAllWorldStories()
    ]).then(([events, locations, characters, stories]) => {
      this.worldEventList = events.sort((a, b) => (a.date > b.date ? 1 : -1));
      this.filteredEventList = this.worldEventList;
      
      this.worldLocationList = locations;
      this.filteredLocationList = locations;
      
      this.worldCharacterList = characters;
      this.filteredCharacterList = characters;
      
      this.worldStoryList = stories;
      this.filteredStoryList = stories;
      
      // Populate filter arrays
      this.allCharacters = characters;
      this.allStories = stories;
      this.allLocations = locations;
    });
  }

  onFilterChange(filterState: FilterState) {
    // Apply text search to all entity types
    let filteredEvents = [...this.worldEventList];
    let filteredLocations = [...this.worldLocationList];
    let filteredCharacters = [...this.worldCharacterList];
    let filteredStories = [...this.worldStoryList];
    
    if (filterState.searchTerms.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        matchesSearchTerms(filterState.searchTerms, 
          worldEvent?.tags.join(' '),
          worldEvent?.name,
          worldEvent?.description)
      );
      
      filteredLocations = filteredLocations.filter((worldLocation) =>
        matchesSearchTerms(filterState.searchTerms,
          worldLocation?.tags.join(' '),
          worldLocation?.name,
          worldLocation?.description)
      );
      
      filteredCharacters = filteredCharacters.filter((worldCharacter) =>
        matchesSearchTerms(filterState.searchTerms,
          worldCharacter?.tags.join(' '),
          worldCharacter?.firstName,
          worldCharacter?.lastName,
          worldCharacter?.altNames.join(' '))
      );
      
      filteredStories = filteredStories.filter((worldStory) =>
        matchesSearchTerms(filterState.searchTerms,
          worldStory?.tags.join(' '),
          worldStory?.title,
          worldStory?.description)
      );
    }
    
    // Apply entity filters to events
    if (filterState.selectedCharacters.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedCharacters.some(selectedChar => 
          worldEvent.characters.some(eventChar => eventChar === selectedChar)
        )
      );
    }
    
    if (filterState.selectedStories.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedStories.some(selectedStory => 
          worldEvent.stories.some(eventStory => eventStory === selectedStory)
        )
      );
    }
    
    if (filterState.selectedLocations.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedLocations.some(selectedLoc => 
          worldEvent.location.some(eventLoc => eventLoc === selectedLoc)
        )
      );
    }
    
    // Date range filter for events
    if (filterState.startDate || filterState.endDate) {
      filteredEvents = filteredEvents.filter((worldEvent) => {
        const eventDate = new Date(worldEvent.date);
        const start = filterState.startDate ? new Date(filterState.startDate) : new Date('1900-01-01');
        const end = filterState.endDate ? new Date(filterState.endDate) : new Date('2099-12-31');
        return eventDate >= start && eventDate <= end;
      });
    }
    
    // Update filtered lists
    this.filteredEventList = filteredEvents;
    this.filteredLocationList = filteredLocations;
    this.filteredCharacterList = filteredCharacters;
    this.filteredStoryList = filteredStories;
  }
  
  async addWorldElement(entityType: EntityType) {
    let newId: string;
    
    switch(entityType) {
      case 'event':
        console.log('Adding new event');
        newId = await this.createEventAndGetId();
        this.router.navigate(['/event', newId]);
        break;
      case 'location':
        console.log('Adding new location');
        newId = await this.createLocationAndGetId();
        this.router.navigate(['/location', newId]);
        break;
      case 'character':
        console.log('Adding new character');
        newId = await this.createCharacterAndGetId();
        this.router.navigate(['/character', newId]);
        break;
      case 'story':
        console.log('Adding new story');
        newId = await this.createStoryAndGetId();
        this.router.navigate(['/story', newId]);
        break;
      default:
        console.log(`Unknown entity type: ${entityType}`);
    }
  }
  
  private async createEventAndGetId(): Promise<string> {
    const events = await this.eventService.getAllWorldEvents();
    const maxId = events.length > 0 ? Math.max(...events.map(e => parseInt(e.id.toString()))) : 0;
    const newId = (maxId + 1).toString();
    
    await fetch('http://localhost:3000/worldevents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newId,
        name: 'New Event',
        date: '',
        description: '',
        location: [],
        characters: [],
        stories: [],
        tags: [],
      }),
    });
    
    return newId;
  }
  
  private async createLocationAndGetId(): Promise<string> {
    const locations = await this.locationService.getAllWorldLocations();
    const maxId = locations.length > 0 ? Math.max(...locations.map(l => parseInt(l.id.toString()))) : 0;
    const newId = (maxId + 1).toString();
    
    await fetch('http://localhost:3000/worldlocations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newId,
        name: 'New Location',
        description: '',
        characters: [],
        stories: [],
        tags: [],
      }),
    });
    
    return newId;
  }
  
  private async createCharacterAndGetId(): Promise<string> {
    const characters = await this.characterService.getAllWorldCharacters();
    const maxId = characters.length > 0 ? Math.max(...characters.map(c => parseInt(c.id))) : 0;
    const newId = (maxId + 1).toString();
    
    await fetch('http://localhost:3000/worldcharacters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newId,
        firstName: 'New',
        lastName: 'Character',
        altNames: [],
        birthdate: '',
        pronouns: '',
        roles: [],
        affiliations: [],
        relationships: [],
        physicalDescription: '',
        nonPhysicalDescription: '',
        stories: [],
        tags: [],
      }),
    });
    
    return newId;
  }
  
  private async createStoryAndGetId(): Promise<string> {
    const stories = await this.storyService.getAllWorldStories();
    const maxId = stories.length > 0 ? Math.max(...stories.map(s => parseInt(s.id.toString()))) : 0;
    const newId = (maxId + 1).toString();
    
    await fetch('http://localhost:3000/worldstories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newId,
        title: 'New Story',
        description: '',
        characters: [],
        locations: [],
        tags: [],
      }),
    });
    
    return newId;
  }
  
  onTagClick(tag: string) {
    console.log('Tag clicked:', tag);
    if (this.searchFilter) {
      this.searchFilter.addSearchTerm(tag);
    }
  }
}
