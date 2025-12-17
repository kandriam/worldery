import { Component, inject, ViewChild } from '@angular/core';
import {HomeRow} from '../../components/home-row/home-row';
import {HomeGrid} from '../../components/home-grid/home-grid';
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
  imports: [SearchFilter, HomeGrid, Timeline],
  templateUrl: 'event-home.html',
  styleUrls: ['../pages.css', 'event-home.css', '../../../styles.css'],
})
export class EventHome {
  @ViewChild('searchFilterCmp') searchFilter!: SearchFilter;
  eventService = inject(WorldEventService);
  characterService = inject(WorldCharacterService);
  storyService = inject(WorldStoryService);
  locationService = inject(WorldLocationService);

  filteredEventList: import('../../worldevent').WorldEventInfo[] = [];
  worldEventList: import('../../worldevent').WorldEventInfo[] = [];
  allCharacters: import('../../worldcharacter').WorldCharacterInfo[] = [];
  allStories: import('../../worldstory').WorldStoryInfo[] = [];
  allLocations: import('../../worldlocation').WorldLocationInfo[] = [];

  viewMode: 'timeline' | 'grid' = 'timeline';

  filterConfig = {
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
      this.worldEventList = events.sort((a: any, b: any) => (a.date > b.date ? 1 : -1));
      this.allCharacters = characters;
      this.allStories = stories;
      this.allLocations = locations;
      this.filteredEventList = this.worldEventList;
    });
  }

  onFilterChange(filterState: import('../../components/search-filter/search-filter').FilterState) {
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
          worldEvent.characters.some((eventChar: string) => eventChar === selectedChar)
        )
      );
    }

    // Story filter
    if (filterState.selectedStories.length > 0) {
      filtered = filtered.filter((worldEvent) =>
        filterState.selectedStories.some(selectedStory =>
          worldEvent.stories.some((eventStory: string) => eventStory === selectedStory)
        )
      );
    }

    // Location filter
    if (filterState.selectedLocations.length > 0) {
      filtered = filtered.filter((worldEvent) =>
        filterState.selectedLocations.some(selectedLoc =>
          worldEvent.location.some((eventLoc: string) => eventLoc === selectedLoc)
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
      'New Event', // eventTitle
      '',          // eventDate
      '',          // eventEndDate
      '',          // eventDescription
      [],          // eventLocation
      [],          // eventCharacters
      [],          // eventStories
      [],          // eventTags
      true         // goToPage
    );
  }

  onTagClicked(tag: string) {
    if (this.searchFilter && typeof this.searchFilter.addSearchTerm === 'function') {
      this.searchFilter.addSearchTerm(tag);
    }
  }

  setViewMode(mode: 'timeline' | 'grid') {
    this.viewMode = mode;
  }
}