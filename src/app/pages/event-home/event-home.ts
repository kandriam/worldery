import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Timeline } from '../../components/timeline/timeline/timeline';
import { Calendar } from '../../components/calendar/calendar';
import { WorldEventInfo, WorldEventService, generateBirthdayGhosts } from '../../services/world-event.service';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';
import { WorldStoryInfo, WorldStoryService } from '../../services/world-story.service';
import { WorldLocationInfo, WorldLocationService } from '../../services/world-location.service';
import { WorldInfoService } from '../../services/world.service';
import { SearchFilter, FilterState, FilterConfig, matchesSearchTerms } from '../../components/search-filter/search-filter';
import { CurrentWorldDateService } from '../../services/current-world-date.service';

@Component({
  selector: 'app-event-home',
  imports: [SearchFilter, Timeline, Calendar],
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
  worldInfoService = inject(WorldInfoService);

  filteredEventList: WorldEventInfo[] = [];
  worldEventList: WorldEventInfo[] = [];
  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  worldId: string | null = null;
  isGregorianCalendar = false;

  private readonly VIEW_MODE_KEY = 'eventHomeViewMode';
  viewMode: 'timeline' | 'calendar' = 'timeline';
  router = inject(Router);
  currentWorldDateService = inject(CurrentWorldDateService);

  clearCurrentDate() {
    this.currentWorldDateService.clear();
  }

  filterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: true
  };

  ngOnInit() {
    const saved = localStorage.getItem(this.VIEW_MODE_KEY);
    if (saved === 'calendar') this.viewMode = 'calendar';

    this.route.queryParams.subscribe(params => {
      const worldId = params['world'];
      this.worldId = worldId ?? null;
      if (worldId) {
        this.worldInfoService.getWorld(worldId).subscribe(world => {
          this.isGregorianCalendar = world?.time_system === 'gregorian';
        });
        Promise.all([
          this.eventService.getAllWorldEvents(worldId),
          this.characterService.getAllWorldCharacters(worldId),
        ]).then(([events, characters]) => {
          console.log('[EventHome] loaded events for world', worldId, ':', events.length, events);
          this.allCharacters = characters;
          const ghosts = generateBirthdayGhosts(characters, events);
          this.worldEventList = [...events, ...ghosts].sort((a, b) => (a.date > b.date ? 1 : -1));
          this.filteredEventList = this.worldEventList;
        }).catch(err => console.error('[EventHome] load error:', err));
        this.storyService.getAllWorldStories(worldId).then(stories => {
          this.allStories = stories;
        });
        this.locationService.getAllWorldLocations(worldId).then(locations => {
          this.allLocations = locations;
        });
      } else {
        this.isGregorianCalendar = false;
        Promise.all([
          this.eventService.getAllWorldEvents(),
          this.characterService.getAllWorldCharacters(),
          this.storyService.getAllWorldStories(),
          this.locationService.getAllWorldLocations()
        ]).then(([events, characters, stories, locations]) => {
          this.allCharacters = characters;
          this.allStories = stories;
          this.allLocations = locations;
          const ghosts = generateBirthdayGhosts(characters, events);
          this.worldEventList = [...events, ...ghosts].sort((a, b) => (a.date > b.date ? 1 : -1));
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
          (worldEvent.locations || []).some((eventLoc: any) => String(eventLoc) === String(selectedLoc))
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
        locations: [],
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

  onAddEventOnDate(date: Date) {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    this.eventService.createWorldEvent(
      {
        id: '',
        name: 'New Event',
        date: dateStr,
        description: '',
        locations: [],
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

  setViewMode(mode: 'timeline' | 'calendar') {
    this.viewMode = mode;
    localStorage.setItem(this.VIEW_MODE_KEY, mode);
  }
}