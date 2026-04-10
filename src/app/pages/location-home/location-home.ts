import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeRow } from '../../components/home-row/home-row';
import { HomeGrid } from '../../components/home-grid/home-grid';
import { WorldLocationInfo, WorldLocationService} from '../../services/world-location.service';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';
import { WorldStoryInfo, WorldStoryService } from '../../services/world-story.service';
import { SearchFilter, FilterState, FilterConfig, matchesSearchTerms } from '../../components/search-filter/search-filter';
import { Home } from "../home/home";

@Component({
  selector: 'app-location-home',
  imports: [SearchFilter, HomeRow, Home, HomeGrid],
  templateUrl: 'location-home.html',
  styleUrls: ['../pages.css', 'location-home.css', '../../../styles.css'],
})


export class LocationHome implements OnInit {
    route: ActivatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  @ViewChild('searchFilterCmp') searchFilter!: SearchFilter;
  locationService: WorldLocationService = inject(WorldLocationService);
  characterService: WorldCharacterService = inject(WorldCharacterService);
  storyService: WorldStoryService = inject(WorldStoryService);
  
  filteredLocationList: WorldLocationInfo[] = [];
  worldLocationList: WorldLocationInfo[] = [];
  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  worldId: string | null = null;
  
  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: false
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const worldId = params['world'];
      this.worldId = worldId ?? null;
      if (worldId) {
        this.locationService.getAllWorldLocations(worldId).then(locations => {
          this.worldLocationList = locations;
          this.filteredLocationList = locations;
          this.allLocations = locations;
        });
        this.characterService.getAllWorldCharacters(worldId).then(characters => {
          this.allCharacters = characters;
        });
        this.storyService.getAllWorldStories(worldId).then(stories => {
          this.allStories = stories;
        });
      } else {
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
          worldLocation.related_locations.includes(locationName) ||
          worldLocation.name === locationName
        )
      );
    }
    
    this.filteredLocationList = filtered;
  }

  addWorldLocation() {
    this.locationService.createWorldLocation(
      {
        id: '',
        name: 'New Location',
        description: '',
        characters: [],
        stories: [],
        related_locations: [],
        tags: [],
        world: this.worldId ?? undefined
      } as WorldLocationInfo,
      true
    ).subscribe({
      next: (location) => {
        if (location) {
          this.router.navigate(['/location', location.id]);
        }
      },
      error: (err) => console.error('Failed to create location:', err)
    });
  }

  onTagClicked(tag: string) {
    if (this.searchFilter && typeof this.searchFilter.addSearchTerm === 'function') {
      this.searchFilter.addSearchTerm(tag);
    }
  }
}