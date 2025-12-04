import { Component, inject } from '@angular/core';
import {HomeRow} from '../../components/home-row/home-row';
import {WorldLocationInfo} from '../../worldlocation';
import {WorldLocationService} from '../../services/world-location.service';
import {WorldCharacterService} from '../../services/world-character.service';
import {WorldStoryService} from '../../services/world-story.service';
import {WorldCharacterInfo} from '../../worldcharacter';
import {WorldStoryInfo} from '../../worldstory';
import {SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../../components/search-filter/search-filter';

@Component({
  selector: 'app-location-home',
  imports: [SearchFilter, HomeRow],
  templateUrl: 'location-home.html',
  styleUrls: ['../pages.css', 'location-home.css', '../../../styles.css'],
})

export class LocationHome {
  locationService: WorldLocationService = inject(WorldLocationService);
  characterService: WorldCharacterService = inject(WorldCharacterService);
  storyService: WorldStoryService = inject(WorldStoryService);
  
  filteredLocationList: WorldLocationInfo[] = [];
  worldLocationList: WorldLocationInfo[] = [];
  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  
  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: false,
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
    
    // Note: Locations don't typically have direct character/story relationships
    // This filtering would work based on which characters/stories are associated with locations
    // For now, keeping the structure for potential future enhancement
    
    this.filteredLocationList = filtered;
  }

  async addWorldLocation() {
    console.log('Adding new location');
    try {
      await this.locationService.createWorldLocation('New Location', '', [], [], []);
      console.log('Location created successfully');
    } catch (error) {
      console.error('Failed to create location:', error);
    }
  }

  onTagClicked(tag: string) {
    // Handle tag click - could add to search filter
    console.log('Tag clicked:', tag);
  }
}