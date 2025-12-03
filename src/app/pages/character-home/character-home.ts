import {Component, inject} from '@angular/core';
import {CharacterThumbnail} from '../../thumbnail/character-thumbnail/character-thumbnail';
import {WorldCharacterInfo} from '../../worldcharacter';
import {WorldCharacterService} from '../../services/world-character.service';
import {WorldStoryService} from '../../services/world-story.service';
import {WorldStoryInfo} from '../../worldstory';
import {SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../../components/search-filter/search-filter';

@Component({
  selector: 'app-character-home',
  imports: [CharacterThumbnail, SearchFilter],
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
    this.characterService.createWorldCharacter('New Character', '', [], '', '', [], [], [], '', '', [], []);
  }
}