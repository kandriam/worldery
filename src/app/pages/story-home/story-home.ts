import { Component, inject, ViewChild } from '@angular/core';
import {HomeRow} from '../../components/home-row/home-row';
import {HomeGrid} from '../../components/home-grid/home-grid';
import {WorldStoryInfo} from '../../worldstory';
import {WorldStoryService} from '../../services/world-story.service';
import {WorldCharacterService} from '../../services/world-character.service';
import {WorldLocationService} from '../../services/world-location.service';
import {WorldCharacterInfo} from '../../worldcharacter';
import {WorldLocationInfo} from '../../worldlocation';
import {SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../../components/search-filter/search-filter';

@Component({
  selector: 'app-story-home',
  imports: [SearchFilter, HomeGrid],
  templateUrl: 'story-home.html',
  styleUrls: ['../pages.css', 'story-home.css', '../../../styles.css'],
})


export class StoryHome {
  @ViewChild('searchFilterCmp') searchFilter!: SearchFilter;
  storyService: WorldStoryService = inject(WorldStoryService);
  characterService: WorldCharacterService = inject(WorldCharacterService);
  locationService: WorldLocationService = inject(WorldLocationService);
  
  filteredStoryList: WorldStoryInfo[] = [];
  worldStoryList: WorldStoryInfo[] = [];
  allCharacters: WorldCharacterInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  
  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: false,
    showLocations: true,
    showDateRange: false
  };

  constructor() {
    Promise.all([
      this.storyService.getAllWorldStories(),
      this.characterService.getAllWorldCharacters(),
      this.locationService.getAllWorldLocations()
    ]).then(([stories, characters, locations]) => {
      this.worldStoryList = stories;
      this.filteredStoryList = stories;
      this.allCharacters = characters;
      this.allLocations = locations;
    });
  }

  onFilterChange(filterState: FilterState) {
    let filtered = [...this.worldStoryList];
    
    // Text search filter
    if (filterState.searchTerms.length > 0) {
      filtered = filtered.filter((worldStory) =>
        matchesSearchTerms(filterState.searchTerms,
          worldStory?.tags.join(' '),
          worldStory?.title,
          worldStory?.description)
      );
    }
    
    // Character filter
    if (filterState.selectedCharacters.length > 0) {
      filtered = filtered.filter((worldStory) =>
        filterState.selectedCharacters.some(selectedChar => 
          worldStory.characters.some(storyChar => storyChar === selectedChar)
        )
      );
    }
    
    // Location filter
    if (filterState.selectedLocations.length > 0) {
      filtered = filtered.filter((worldStory) =>
        filterState.selectedLocations.some(selectedLoc => 
          worldStory.locations.some(storyLoc => storyLoc === selectedLoc)
        )
      );
    }
    
    this.filteredStoryList = filtered;
  }

  async addWorldStory() {
    console.log('Adding new story');
    try {
      await this.storyService.createWorldStory(
        'New Story',
        '',
        [],
        [],
        [],
        true);
      console.log('Story created successfully');
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  }

  onTagClicked(tag: string) {
    if (this.searchFilter && typeof this.searchFilter.addSearchTerm === 'function') {
      this.searchFilter.addSearchTerm(tag);
    }
  }
}