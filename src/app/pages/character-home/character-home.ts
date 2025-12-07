import { Component, inject } from '@angular/core';
import {HomeRow} from '../../components/home-row/home-row';
import {WorldCharacterInfo} from '../../worldcharacter';
import {WorldCharacterService} from '../../services/world-character.service';
import {WorldStoryService} from '../../services/world-story.service';
import {WorldStoryInfo} from '../../worldstory';
import {SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../../components/search-filter/search-filter';
import { Router } from '@angular/router';

@Component({
  selector: 'app-character-home',
  imports: [SearchFilter, HomeRow],
  templateUrl: 'character-home.html',
  styleUrls: ['../pages.css', 'character-home.css', '../../../styles.css'],
})

export class CharacterHome {
  characterService: WorldCharacterService = inject(WorldCharacterService);
  storyService: WorldStoryService = inject(WorldStoryService);
  
  filteredCharacterList: WorldCharacterInfo[] = [];
  worldCharacterList: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  
  filterConfig: FilterConfig = {
    showCharacters: false,
    showStories: true,
    showLocations: false,
    showDateRange: false
  };

  router: Router = inject(Router);

  constructor() {
    Promise.all([
      this.characterService.getAllWorldCharacters(),
      this.storyService.getAllWorldStories()
    ]).then(([characters, stories]) => {
      this.worldCharacterList = characters;
      this.filteredCharacterList = characters;
      this.allStories = stories;
    });
  }

  onFilterChange(filterState: FilterState) {
    let filtered = [...this.worldCharacterList];
    
    // Text search filter
    if (filterState.searchTerms.length > 0) {
      filtered = filtered.filter((worldCharacter) =>
        matchesSearchTerms(filterState.searchTerms,
          worldCharacter?.tags.join(' '),
          worldCharacter?.firstName,
          worldCharacter?.lastName,
          worldCharacter?.altNames.join(' '))
      );
    }
    
    // Story filter
    if (filterState.selectedStories.length > 0) {
      filtered = filtered.filter((worldCharacter) =>
        filterState.selectedStories.some(selectedStory => 
          worldCharacter.stories.some(charStory => charStory === selectedStory)
        )
      );
    }
    
    this.filteredCharacterList = filtered;
  }

  addWorldCharacter() {
    console.log('Adding new character');
    this.characterService.createWorldCharacter('New', 'Character', [], '', '', [], [], [], '', '', [], []);
  }

  onTagClicked(tag: string) {
    // Handle tag click - could add to search filter
    console.log('Tag clicked:', tag);
  }
}                                           