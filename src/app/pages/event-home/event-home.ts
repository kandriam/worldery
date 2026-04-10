import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeRow } from '../../components/home-row/home-row';
import { HomeGrid } from '../../components/home-grid/home-grid';
import { Timeline } from '../../components/timeline/timeline/timeline';
import { WorldEventInfo, WorldEventService } from '../../services/world-event.service';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';
import { WorldStoryInfo, WorldStoryService } from '../../services/world-story.service';
import { WorldLocationInfo, WorldLocationService } from '../../services/world-location.service';
import { SearchFilter, FilterState, FilterConfig, matchesSearchTerms } from '../../components/search-filter/search-filter';

@Component({
  selector: 'app-event-home',
  imports: [SearchFilter, HomeGrid, Timeline],
  templateUrl: 'event-home.html',
  styleUrls: ['../pages.css', 'event-home.css', '../../../styles.css'],
})
export class EventHome implements OnInit {
    route: ActivatedRoute = inject(ActivatedRoute);
  @ViewChild('searchFilterCmp') searchFilter!: SearchFilter;
  eventService = inject(WorldEventService);
  characterService = inject(WorldCharacterService);
  storyService = inject(WorldStoryService);
  locationService = inject(WorldLocationService);

  filteredEventList: WorldEventInfo[] = [];
  worldEventList: WorldEventInfo[] = [];
  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  worldId: string | null = null;

  viewMode: 'timeline' | 'grid' = 'timeline';
  router = inject(Router);

  filterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: true
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const worldId = params['world'];
      this.worldId = worldId ?? null;
      if (worldId) {
        this.eventService.getAllWorldEvents(worldId).then(events => {
          this.worldEventList = events.sort((a: any, b: any) => (a.date > b.date ? 1 : -1));
          this.filteredEventList = this.worldEventList;
        });
        this.characterService.getAllWorldCharacters(worldId).then(characters => {
          this.allCharacters = characters;
        });
        this.storyService.getAllWorldStories(worldId).then(stories => {
          this.allStories = stories;
        });
        this.locationService.getAllWorldLocations(worldId).then(locations => {
          this.allLocations = locations;
        });
      } else {
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
    this.eventService.createWorldEvent(
      {
        id: '',
        name: 'New Event',
        date: new Date().toISOString().split('T')[0],
        description: '',
        location: [],
        characters: [],
        stories: [],
        tags: [],
        world: this.worldId ?? undefined
      } as WorldEventInfo,
      true
    ).subscribe({
      next: (event) => {
        if (event) {
          this.router.navigate(['/event', event.id]);
        }
      },
      error: (err) => console.error('Failed to create event:', err)
    });
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