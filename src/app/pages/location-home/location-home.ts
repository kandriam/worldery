import { Component, inject, ViewChild } from '@angular/core';
import {HomeRow} from '../../components/home-row/home-row';
import {HomeGrid} from '../../components/home-grid/home-grid';
import {WorldLocationInfo} from '../../worldlocation';
import {WorldLocationService} from '../../services/world-location.service';
import {WorldCharacterService} from '../../services/world-character.service';
import {WorldStoryService} from '../../services/world-story.service';
import {WorldCharacterInfo} from '../../worldcharacter';
import {WorldStoryInfo} from '../../worldstory';
import {SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../../components/search-filter/search-filter';
import { Home } from "../home/home";

@Component({
  selector: 'app-location-home',
  imports: [SearchFilter, HomeRow, Home, HomeGrid],
  templateUrl: 'location-home.html',
  styleUrls: ['../pages.css', 'location-home.css', '../../../styles.css'],
})


export class LocationHome {
  @ViewChild('searchFilterCmp') searchFilter!: SearchFilter;
  locationService: WorldLocationService = inject(WorldLocationService);
  characterService: WorldCharacterService = inject(WorldCharacterService);
  storyService: WorldStoryService = inject(WorldStoryService);
  
  filteredLocationList: WorldLocationInfo[] = [];
  worldLocationList: WorldLocationInfo[] = [];
  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  
  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: false
  };

  constructor() {
    Promise.all([
      this.locationService.getAllWorldLocations(),
      this.characterService.getAllWorldCharacters(),
      this.storyService.getAllWorldStories()
    ]).then(([locations, characters, stories]) => {
      this.worldLocationList = locations;
      this.filteredLocationList = locations;
      this.allCharacters = characters;
      this.allLocations = locations;
      this.allStories = stories;
    });
  }

  onFilterChange(filterState: FilterState) {
    let filtered = [...this.worldLocationList];
    
    // Text search filter
    if (filterState.searchTerms.length > 0) {
      filtered = filtered.filter((worldLocation) =>
        matchesSearchTerms(filterState.searchTerms,
          worldLocation?.tags.join(' '),
          worldLocation?.name,
          worldLocation?.description)
      );
    }
    
    // Character filter - show locations that have these characters
    if (filterState.selectedCharacters.length > 0) {
      filtered = filtered.filter((worldLocation) =>
        filterState.selectedCharacters.some(characterName =>
          worldLocation.characters.includes(characterName)
        )
      );
    }
    
    // Story filter - show locations that are part of these stories
    if (filterState.selectedStories.length > 0) {
      filtered = filtered.filter((worldLocation) =>
        filterState.selectedStories.some(storyName =>
          worldLocation.stories.includes(storyName)
        )
      );
    }
    
    // Location filter - show locations that are related to these locations
    if (filterState.selectedLocations.length > 0) {
      filtered = filtered.filter((worldLocation) =>
        filterState.selectedLocations.some(locationName =>
          worldLocation.relatedLocations.includes(locationName) ||
          worldLocation.name === locationName
        )
      );
    }
    
    this.filteredLocationList = filtered;
  }

  async addWorldLocation() {
    console.log('Adding new location');
    try {
      await this.locationService.createWorldLocation(
        'New Location',
        '',
        [],
        [],
        [],
        true);
      console.log('Location created successfully');
    } catch (error) {
      console.error('Failed to create location:', error);
    }
  }

  onTagClicked(tag: string) {
    if (this.searchFilter && typeof this.searchFilter.addSearchTerm === 'function') {
      this.searchFilter.addSearchTerm(tag);
    }
  }
}