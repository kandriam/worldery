import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeRow } from '../../components/home-row/home-row';
import { HomeGrid } from '../../components/home-grid/home-grid';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';
import { WorldStoryInfo, WorldStoryService } from '../../services/world-story.service';
import { SearchFilter, FilterState, FilterConfig, matchesSearchTerms } from '../../components/search-filter/search-filter';
import { Router } from '@angular/router';

@Component({
  selector: 'app-character-home',
  imports: [SearchFilter, HomeGrid],
  templateUrl: 'character-home.html',
  styleUrls: ['../pages.css', 'character-home.css', '../../../styles.css'],
})


export class CharacterHome implements OnInit {
    route: ActivatedRoute = inject(ActivatedRoute);
  @ViewChild('searchFilterCmp') searchFilter!: SearchFilter;
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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const worldId = params['world'];
      if (worldId) {
        this.characterService.getAllWorldCharacters(worldId).then(characters => {
          this.worldCharacterList = characters;
          this.filteredCharacterList = characters;
        });
        this.storyService.getAllWorldStories(worldId).then(stories => {
          this.allStories = stories;
        });
      } else {
        Promise.all([
          this.characterService.getAllWorldCharacters(),
          this.storyService.getAllWorldStories()
        ]).then(([characters, stories]) => {
          this.worldCharacterList = characters;
          this.filteredCharacterList = characters;
          this.allStories = stories;
        });
      }
    });
  }

  onFilterChange(filterState: FilterState) {
    let filtered = [...this.worldCharacterList];
    
    // Text search filter
    if (filterState.searchTerms.length > 0) {
      filtered = filtered.filter((worldCharacter) =>
        matchesSearchTerms(filterState.searchTerms,
          worldCharacter?.tags.join(' '),
          worldCharacter?.personal_name,
          worldCharacter?.family_name,
          worldCharacter?.alt_names.join(' '))
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
    this.characterService.createWorldCharacter(
      {id: '',
      personal_name: 'New',
      family_name: 'Character',
      alt_names: [],
      physical_description: '',
      non_physical_description: '',
      pronouns: '',
      roles: [],
      affiliations: [],
      relationships: [],
      stories: [],
      tags: []
    } as WorldCharacterInfo, true);
  }

  onTagClicked(tag: string) {
    if (this.searchFilter && typeof this.searchFilter.addSearchTerm === 'function') {
      this.searchFilter.addSearchTerm(tag);
    }
  }
}                                           