import {Component, inject} from '@angular/core';
import {WorldEventInfo} from '../worldevent';
import {WorldEventService} from '../services/world-event.service';

import { WorldLocationInfo } from '../worldlocation';
import { WorldLocationService } from '../services/world-location.service';

import { WorldCharacterInfo } from '../worldcharacter';
import { WorldCharacterService } from '../services/world-character.service';

import { WorldStoryInfo } from '../worldstory';
import { WorldStoryService } from '../services/world-story.service';
import {SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../components/search-filter/search-filter';
import {HomeRow, EntityType} from '../components/home-row/home-row';

@Component({
  selector: 'app-home',
  imports: [SearchFilter, HomeRow],
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
  
  addWorldElement(entityType: EntityType) {
    // Placeholder for add functionality
    console.log(`Add ${entityType} functionality would be implemented here`);
  }
}
