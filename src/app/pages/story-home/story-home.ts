import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { HomeRow} from '../../components/home-row/home-row';
import { HomeGrid} from '../../components/home-grid/home-grid';
import { WorldStoryInfo, WorldStoryService} from '../../services/world-story.service';
import { WorldLocationInfo, WorldLocationService} from '../../services/world-location.service';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';
import { SearchFilter, FilterState, FilterConfig, matchesSearchTerms} from '../../components/search-filter/search-filter';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-story-home',
  imports: [SearchFilter, HomeGrid],
  templateUrl: 'story-home.html',
  styleUrls: ['../pages.css', 'story-home.css', '../../../styles.css'],
})


export class StoryHome implements OnInit {
  @ViewChild('searchFilterCmp') searchFilter!: SearchFilter;
  storyService: WorldStoryService = inject(WorldStoryService);
  characterService: WorldCharacterService = inject(WorldCharacterService);
  locationService: WorldLocationService = inject(WorldLocationService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  
  filteredStoryList: WorldStoryInfo[] = [];
  worldStoryList: WorldStoryInfo[] = [];
  allCharacters: WorldCharacterInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  worldId: string | null = null;
  
  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: false,
    showLocations: true,
    showDateRange: false
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const worldId = params['world'];
      this.worldId = worldId ?? null;
      if (worldId) {
        Promise.all([
          this.storyService.getAllWorldStories(worldId),
          this.characterService.getAllWorldCharacters(worldId),
          this.locationService.getAllWorldLocations(worldId)
        ]).then(([stories, characters, locations]) => {
          const substoryIds = new Set(stories.flatMap(s => s.substories ?? []));
          this.worldStoryList = stories.filter(s => !substoryIds.has(s.id));
          this.filteredStoryList = [...this.worldStoryList];
          this.allCharacters = characters;
          this.allLocations = locations;
        });
      } else {
        Promise.all([
          this.storyService.getAllWorldStories(),
          this.characterService.getAllWorldCharacters(),
          this.locationService.getAllWorldLocations()
        ]).then(([stories, characters, locations]) => {
          const substoryIds = new Set(stories.flatMap(s => s.substories ?? []));
          this.worldStoryList = stories.filter(s => !substoryIds.has(s.id));
          this.filteredStoryList = [...this.worldStoryList];
          this.allCharacters = characters;
          this.allLocations = locations;
        });
      }
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

  addWorldStory() {
    this.storyService.createWorldStory(
      {
        id: '',
        title: 'New Story',
        description: '',
        characters: [],
        locations: [],
        substories: [],
        genre: [],
        tags: [],
        world: this.worldId ?? undefined
      } as WorldStoryInfo,
      true
    ).subscribe({
      next: (story) => {
        if (story) {
          this.router.navigate(['/story', story.id]);
        }
      },
      error: (err) => console.error('Failed to create story:', err)
    });
  }

  onTagClicked(tag: string) {
    if (this.searchFilter && typeof this.searchFilter.addSearchTerm === 'function') {
      this.searchFilter.addSearchTerm(tag);
    }
  }
}