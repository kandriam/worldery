import { Component, inject } from '@angular/core';
import {HomeRow} from '../../components/home-row/home-row';
import {Timeline} from '../../components/timeline/timeline/timeline';
import {WorldEventInfo} from '../../worldevent';
import {WorldEventService} from '../../services/world-event.service';
import {WorldCharacterService} from '../../services/world-character.service';
import {WorldStoryService} from '../../services/world-story.service';
import {WorldLocationService} from '../../services/world-location.service';
import {WorldCharacterInfo} from '../../worldcharacter';
import {WorldStoryInfo} from '../../worldstory';
import {WorldLocationInfo} from '../../worldlocation';
import {SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../../components/search-filter/search-filter';

@Component({
  selector: 'app-event-home',
  imports: [SearchFilter, HomeRow, Timeline],
  templateUrl: 'event-home.html',
  styleUrls: ['../pages.css', 'event-home.css', '../../../styles.css'],
})

export class EventHome {
  eventService: WorldEventService = inject(WorldEventService);
  characterService: WorldCharacterService = inject(WorldCharacterService);
  storyService: WorldStoryService = inject(WorldStoryService);
  locationService: WorldLocationService = inject(WorldLocationService);
  
  filteredEventList: WorldEventInfo[] = [];
  worldEventList: WorldEventInfo[] = [];
  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  
  viewMode: 'timeline' | 'grid' = 'timeline';

  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: true
  };

  constructor() {
    // Load all data
    Promise.all([
      this.eventService.getAllWorldEvents(),
      this.characterService.getAllWorldCharacters(),
      this.storyService.getAllWorldStories(),
      this.locationService.getAllWorldLocations()
    ]).then(([events, characters, stories, locations]) => {
      this.worldEventList = events.sort((a, b) => (a.date > b.date ? 1 : -1));
      this.allCharacters = characters;
      this.allStories = stories;
      this.allLocations = locations;
      this.filteredEventList = this.worldEventList;
    });
  }

  onFilterChange(filterState: FilterState) {
    let filtered = [...this.worldEventList];
    
    // Text search filter
    if (filterState.searchTerms.length > 0) {
      filtered = filtered.filter((worldEvent) =>
        matchesSearchTerms(filterState.searchTerms,
          worldEvent?.tags.join(' '),
          worldEvent?.name,
          worldEvent?.description)
      );
    }
    
    // Character filter
    if (filterState.selectedCharacters.length > 0) {
      filtered = filtered.filter((worldEvent) =>
        filterState.selectedCharacters.some(selectedChar => 
          worldEvent.characters.some(eventChar => eventChar === selectedChar)
        )
      );
    }
    
    // Story filter
    if (filterState.selectedStories.length > 0) {
      filtered = filtered.filter((worldEvent) =>
        filterState.selectedStories.some(selectedStory => 
          worldEvent.stories.some(eventStory => eventStory === selectedStory)
        )
      );
    }
    
    // Location filter
    if (filterState.selectedLocations.length > 0) {
      filtered = filtered.filter((worldEvent) =>
        filterState.selectedLocations.some(selectedLoc => 
          worldEvent.location.some(eventLoc => eventLoc === selectedLoc)
        )
      );
    }
    
    // Date range filter
    if (filterState.startDate || filterState.endDate) {
      filtered = filtered.filter((worldEvent) => {
        const eventDate = new Date(worldEvent.date);
        const start = filterState.startDate ? new Date(filterState.startDate) : new Date('1900-01-01');
        const end = filterState.endDate ? new Date(filterState.endDate) : new Date('2099-12-31');
        return eventDate >= start && eventDate <= end;
      });
    }
    
    this.filteredEventList = filtered;
  }

  addWorldEvent() {
    console.log('Adding new event');
    this.eventService.createWorldEvent(
      'New Event',
      '',
      '',
      '',
      [],
      [],
      [],
      [],
      true);
  }

  onTagClicked(tag: string) {
    // Handle tag click - could add to search filter
    console.log('Tag clicked:', tag);
  }
  
  setViewMode(mode: 'timeline' | 'grid') {
    this.viewMode = mode;
  }
}