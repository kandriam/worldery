import { Component, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';

import { WorldInfo, WorldInfoService } from '../../services/world.service';
import { WorldEventInfo, WorldEventService } from '../../services/world-event.service';
import { WorldLocationInfo, WorldLocationService } from '../../services/world-location.service';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';
import { AuthService } from '../../services/auth.service';
import { WorldStoryInfo, WorldStoryService } from '../../services/world-story.service';
import { SearchFilter, FilterState, FilterConfig, matchesSearchTerms } from '../../components/search-filter/search-filter';
import { HomeRow, EntityType } from '../../components/home-row/home-row';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { Subscription, debounceTime } from 'rxjs';

@Component({
  selector: 'app-world-home',
  imports: [SearchFilter, HomeRow, ReactiveFormsModule],
  templateUrl: 'world-home.html',
  styleUrls: ['./world-home.css', '../pages.css', '../../../styles.css'],
})

export class WorldHome implements OnInit, OnDestroy {
  @ViewChild(SearchFilter) searchFilter!: SearchFilter;
  authService: AuthService = inject(AuthService);

  worldInfoService: WorldInfoService = inject(WorldInfoService);
  filteredWorldList: WorldInfo[] = [];
  allWorlds: WorldInfo[] = [];

  world: WorldInfo | null = null;
  saveSuccess = false;

  eventService: WorldEventService = inject(WorldEventService);
  filteredEventList: WorldEventInfo[] = [];
  worldEventList: WorldEventInfo[] = [];

  locationService: WorldLocationService = inject(WorldLocationService);
  filteredLocationList: WorldLocationInfo[] = [];
  worldLocationList: WorldLocationInfo[] = [];

  characterService: WorldCharacterService = inject(WorldCharacterService);
  filteredCharacterList: WorldCharacterInfo[] = []
  worldCharacterList: WorldCharacterInfo[] = [];

  storyService: WorldStoryService = inject(WorldStoryService);
  worldStoryList: WorldStoryInfo[] = [];
  filteredStoryList: WorldStoryInfo[] = [];

  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);
  settingsService: SettingsService = inject(SettingsService);
  private autoSaveSubscription?: Subscription;

  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  allLocations: WorldLocationInfo[] = [];

  selectedCharacters: string[] = [];
  selectedStories: string[] = [];
  selectedLocations: string[] = [];
  
  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: true
  };

  selectWorldForm = new FormGroup({
    selectedWorld: new FormControl('')
  });

  worldInfoForm = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    timeSystem: new FormControl(''),
    genres: new FormControl(''),
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) this.loadWorldInfo(id);
    });

    this.autoSaveSubscription = this.worldInfoForm.valueChanges.pipe(debounceTime(1500)).subscribe(() => {
      if (this.settingsService.getCurrentSettings().autoSave) {
        this.saveWorldInfo();
      }
    });
  }

  ngOnDestroy() {
    this.autoSaveSubscription?.unsubscribe();
  }

  constructor() {
    this.worldInfoService.getWorlds().subscribe(worlds => {
      this.allWorlds = worlds;
      this.filteredWorldList = worlds;
    });
  }

  onWorldSelect() {
    const selectedWorldId = this.selectWorldForm.value.selectedWorld;
    if (selectedWorldId) {
      this.loadWorldInfo(selectedWorldId);
    }
  }

  loadWorldInfo(worldId: string) {
    this.worldInfoService.getWorld(worldId).subscribe((world) => {
      if (!world) { this.world = null; this.worldInfoForm.reset(); return; }
      this.world = world;
      this.worldInfoForm.patchValue({
        name: world.title || '',
        description: world.description || '',
        timeSystem: world.timeSystem || '',
        genres: world.genres ? world.genres.join(', ') : '',
      }, { emitEvent: false });
    });
    Promise.all([
      this.eventService.getAllWorldEvents(worldId),
      this.locationService.getAllWorldLocations(worldId),
      this.characterService.getAllWorldCharacters(worldId),
      this.storyService.getAllWorldStories(worldId)
    ]).then(([events, locations, characters, stories]) => {
      this.worldEventList = events.sort((a, b) => (a.date > b.date ? 1 : -1));
      this.filteredEventList = this.worldEventList;
      this.worldLocationList = locations;
      this.filteredLocationList = locations;
      this.worldCharacterList = characters;
      this.filteredCharacterList = characters;
      this.worldStoryList = stories;
      this.filteredStoryList = stories;
      this.allCharacters = characters;
      this.allStories = stories;
      this.allLocations = locations;
    });
  }

  onFilterChange(filterState: FilterState) {
    let filteredEvents = [...this.worldEventList];
    let filteredLocations = [...this.worldLocationList];
    let filteredCharacters = [...this.worldCharacterList];
    let filteredStories = [...this.worldStoryList];
    
    if (filterState.searchTerms.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        matchesSearchTerms(filterState.searchTerms, worldEvent?.tags.join(' '), worldEvent?.name, worldEvent?.description)
      );
      filteredLocations = filteredLocations.filter((worldLocation) =>
        matchesSearchTerms(filterState.searchTerms, worldLocation?.tags.join(' '), worldLocation?.name, worldLocation?.description, worldLocation?.characters.join(' '), worldLocation?.stories.join(' '))
      );
      filteredCharacters = filteredCharacters.filter((worldCharacter) =>
        matchesSearchTerms(filterState.searchTerms, worldCharacter?.tags.join(' '), worldCharacter?.personal_name, worldCharacter?.family_name, worldCharacter?.alt_names.join(' '), worldCharacter?.physical_description, worldCharacter?.non_physical_description, worldCharacter?.roles.join(' '), worldCharacter?.affiliations.join(' '))
      );
      filteredStories = filteredStories.filter((worldStory) =>
        matchesSearchTerms(filterState.searchTerms, worldStory?.tags.join(' '), worldStory?.title, worldStory?.description, worldStory?.characters.join(' '), worldStory?.locations.join(' '))
      );
    }
    
    if (filterState.selectedCharacters.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedCharacters.some(selectedChar => worldEvent.characters.some(eventChar => eventChar === selectedChar))
      );
    }
    if (filterState.selectedStories.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedStories.some(selectedStory => worldEvent.stories.some(eventStory => eventStory === selectedStory))
      );
    }
    if (filterState.selectedLocations.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedLocations.some(selectedLoc => worldEvent.location.some(eventLoc => eventLoc === selectedLoc))
      );
    }
    if (filterState.startDate || filterState.endDate) {
      filteredEvents = filteredEvents.filter((worldEvent) => {
        const eventDate = new Date(worldEvent.date);
        const start = filterState.startDate ? new Date(filterState.startDate) : new Date('1900-01-01');
        const end = filterState.endDate ? new Date(filterState.endDate) : new Date('2099-12-31');
        return eventDate >= start && eventDate <= end;
      });
    }
    
    this.filteredEventList = filteredEvents;
    this.filteredLocationList = filteredLocations;
    this.filteredCharacterList = filteredCharacters;
    this.filteredStoryList = filteredStories;
    this.selectedCharacters = filterState.selectedCharacters;
    this.selectedStories = filterState.selectedStories;
    this.selectedLocations = filterState.selectedLocations;
  }

  deleteWorld() {
    if (!this.world?.id) return;
    if (!confirm(`Are you sure you want to delete "${this.world.title}"? This cannot be undone.`)) return;
    this.worldInfoService.deleteWorld(this.world.id).subscribe(() => {
      this.router.navigate(['/home']);
    });
  }

  saveWorldInfo() {
    if (this.world) {
      const formValues = this.worldInfoForm.value;
      this.world.title = formValues.name || '';
      this.world.description = formValues.description || '';
      this.world.timeSystem = formValues.timeSystem || '';
      this.world.genres = (formValues.genres || '').split(',').map((g: string) => g.trim()).filter((g: string) => g);
      this.worldInfoService.updateWorld(this.world.id, { ...this.world }).subscribe(updatedWorld => {
        if (updatedWorld) {
          this.world = updatedWorld;
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 2000);
        }
      });
    }
  }
  
  async addWorldElement(entityType: EntityType) {
    let newId: string;
    switch(entityType) {
      case 'event':
        newId = await this.createEventAndGetId();
        this.router.navigate(['/event', newId]); break;
      case 'location':
        newId = await this.createLocationAndGetId();
        this.router.navigate(['/location', newId]); break;
      case 'character':
        newId = await this.createCharacterAndGetId();
        this.router.navigate(['/character', newId]); break;
      case 'story':
        newId = await this.createStoryAndGetId();
        this.router.navigate(['/story', newId]); break;
    }
  }
  
  private async createEventAndGetId(): Promise<string> {
    const newEvent = { id: '', name: 'New Event', description: '', date: new Date().toISOString().split('T')[0], location: [], characters: [], stories: [], tags: [], world: this.world?.id } as WorldEventInfo;
    return this.eventService.createWorldEvent(newEvent, false).toPromise().then(event => {
      if (event) return event.id;
      else throw new Error('Failed to create event');
    });
  }
  
  private async createLocationAndGetId(): Promise<string> {
    const newLocation = { id: '', name: 'New Location', description: '', characters: [], stories: [], related_locations: [], tags: [], world: this.world?.id } as WorldLocationInfo;
    return this.locationService.createWorldLocation(newLocation, false).toPromise().then(location => {
      if (location) return location.id;
      else throw new Error('Failed to create location');
    });
  }
  
  private async createCharacterAndGetId(): Promise<string> {
    const newChar = { id: '', personal_name: 'New', family_name: 'Character', alt_names: [], physical_description: '', non_physical_description: '', pronouns: '', roles: [], affiliations: [], relationships: [], stories: [], tags: [], world: this.world?.id } as WorldCharacterInfo;
    return this.characterService.createWorldCharacter(newChar, false).toPromise().then(character => {
      if (character) return character.id;
      else throw new Error('Failed to create character');
    });
  }
  
  private async createStoryAndGetId(): Promise<string> {
    const newStory = { id: '', title: 'New Story', description: '', characters: [], locations: [], substories: [], genre: [], tags: [], world: this.world?.id } as WorldStoryInfo;
    return this.storyService.createWorldStory(newStory, false).toPromise().then(story => {
      if (story) return story.id;
      else throw new Error('Failed to create story');
    });
  }
  
  onTagClick(tag: string) {
    if (this.searchFilter) {
      this.searchFilter.addSearchTerm(tag);
    }
  }
}
