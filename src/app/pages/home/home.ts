import { Component, inject, ViewChild } from '@angular/core';

import { WorldInfo, WorldInfoService } from '../../services/world.service';
import { WorldEventInfo, WorldEventService } from '../../services/world-event.service';
import { WorldLocationInfo, WorldLocationService } from '../../services/world-location.service';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';

import { WorldStoryInfo, WorldStoryService } from '../../services/world-story.service';
import { SearchFilter, FilterState, FilterConfig, matchesSearchTerms } from '../../components/search-filter/search-filter';
import { HomeRow, EntityType } from '../../components/home-row/home-row';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [SearchFilter, HomeRow, ReactiveFormsModule],
  templateUrl: 'home.html',
  styleUrls: ['./home.css', '../pages.css', '../../../styles.css'],
})

export class Home {
  @ViewChild(SearchFilter) searchFilter!: SearchFilter;

  worldInfoService: WorldInfoService = inject(WorldInfoService);
  allWorlds: WorldInfo[] = [];
  currentWorldId: string = "1"; // Default to first world
  world: WorldInfo | null = null;
  
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

  // All entities for filter dropdowns
  allCharacters: WorldCharacterInfo[] = [];
  allStories: WorldStoryInfo[] = [];
  allLocations: WorldLocationInfo[] = [];
  
  filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: true
  };

  selectWorldForm = new FormGroup({
    selectedWorld: new FormControl('')
  });

  worldForm = new FormGroup({
    worldName: new FormControl(''),
    worldDescription: new FormControl(''),
    worldTimeSystem: new FormControl(''),
    worldGenres: new FormControl(''),
  });

  constructor() {
    // Load all data for both display and filtering
    Promise.all([
      this.eventService.getAllWorldEvents(),
      this.locationService.getAllWorldLocations(), 
      this.characterService.getAllWorldCharacters(),
      this.storyService.getAllWorldStories()
    ]).then(([events, locations, characters, stories]) => {
      this.worldInfoService.getWorlds().subscribe(worlds => {
        this.allWorlds = worlds;
        // Select the first available world, or set to null if none
        console.log('Hello');
        console.log('Worlds loaded:', this.allWorlds);
        if (this.allWorlds.length > 0) {
          this.currentWorldId = this.allWorlds[0].id;
          this.selectWorldForm.patchValue({ selectedWorld: this.currentWorldId });
        } else {
          this.currentWorldId = '';
          this.world = null;
        }
      });

      this.worldEventList = events.sort((a, b) => (a.date > b.date ? 1 : -1));
      this.filteredEventList = this.worldEventList;
      
      this.worldLocationList = locations;
      // this.worldLocationList = locations.sort((a, b) => (a.name > b.name ? 1 : -1));
      this.filteredLocationList = locations;
      
      this.worldCharacterList = characters;
      // this.worldCharacterList = characters.sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
      this.filteredCharacterList = characters;
      
      this.worldStoryList = stories;
      // this.worldStoryList = stories.sort((a, b) => (a.title > b.title ? 1 : -1));
      this.filteredStoryList = stories;
      
      // Populate filter arrays
      this.allCharacters = characters;
      this.allStories = stories;
      this.allLocations = locations;

      this.currentWorldId = this.allWorlds.length > 0 ? this.allWorlds[0].id : "1";
      this.loadWorldInfo(this.currentWorldId);
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
      if (!world) {
        this.world = null;
        this.worldForm.reset();
        return;
      }
      this.world = world;
      console.log('Selected world:', this.world);
      this.worldForm.patchValue({
        worldName: world.title || '',
        worldDescription: world.description || '',
        worldTimeSystem: world.timeSystem || '',
        worldGenres: world.genres ? world.genres.join(', ') : '',
      });
    });
  }

  onFilterChange(filterState: FilterState) {
    // Apply text search to all entity types
    let filteredEvents = [...this.worldEventList];
    let filteredLocations = [...this.worldLocationList];
    let filteredCharacters = [...this.worldCharacterList];
    let filteredStories = [...this.worldStoryList];
    
    if (filterState.searchTerms.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        matchesSearchTerms(filterState.searchTerms, 
          worldEvent?.tags.join(' '),
          worldEvent?.name,
          worldEvent?.description)
      );
      
      filteredLocations = filteredLocations.filter((worldLocation) =>
        matchesSearchTerms(filterState.searchTerms,
          worldLocation?.tags.join(' '),
          worldLocation?.name,
          worldLocation?.description,
          worldLocation?.characters.join(' '),
          worldLocation?.stories.join(' ')
        )
      );
      
      filteredCharacters = filteredCharacters.filter((worldCharacter) =>
        matchesSearchTerms(filterState.searchTerms,
          worldCharacter?.tags.join(' '),
          worldCharacter?.personal_name,
          worldCharacter?.family_name,
          worldCharacter?.altNames.join(' '),
          worldCharacter?.physicalDescription,
          worldCharacter?.nonPhysicalDescription,
          worldCharacter?.roles.join(' '),
          worldCharacter?.affiliations.join(' ')
        )
      );
      
      filteredStories = filteredStories.filter((worldStory) =>
        matchesSearchTerms(filterState.searchTerms,
          worldStory?.tags.join(' '),
          worldStory?.title,
          worldStory?.description,
          worldStory?.characters.join(' '),
          worldStory?.locations.join(' ')
        )
      );
    }
    
    // Apply entity filters to events
    if (filterState.selectedCharacters.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedCharacters.some(selectedChar => 
          worldEvent.characters.some(eventChar => eventChar === selectedChar)
        )
      );
    }
    
    if (filterState.selectedStories.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedStories.some(selectedStory => 
          worldEvent.stories.some(eventStory => eventStory === selectedStory)
        )
      );
    }
    
    if (filterState.selectedLocations.length > 0) {
      filteredEvents = filteredEvents.filter((worldEvent) =>
        filterState.selectedLocations.some(selectedLoc => 
          worldEvent.location.some(eventLoc => eventLoc === selectedLoc)
        )
      );
    }
    
    // Date range filter for events
    if (filterState.startDate || filterState.endDate) {
      filteredEvents = filteredEvents.filter((worldEvent) => {
        const eventDate = new Date(worldEvent.date);
        const start = filterState.startDate ? new Date(filterState.startDate) : new Date('1900-01-01');
        const end = filterState.endDate ? new Date(filterState.endDate) : new Date('2099-12-31');
        return eventDate >= start && eventDate <= end;
      });
    }
    
    // Update filtered lists
    this.filteredEventList = filteredEvents;
    this.filteredLocationList = filteredLocations;
    this.filteredCharacterList = filteredCharacters;
    this.filteredStoryList = filteredStories;
  }

  saveWorldInfo() {
    if (this.world) {
      const formValues = this.worldForm.value;
      // Update this.world with form values
      this.world.title = formValues.worldName || '';
      this.world.description = formValues.worldDescription || '';
      this.world.timeSystem = formValues.worldTimeSystem || '';
      // Split genres string into array, trimming whitespace
      this.world.genres = (formValues.worldGenres || '').split(',').map((g: string) => g.trim()).filter((g: string) => g);

      this.worldInfoService.updateWorld(this.world.id, {
        ...this.world
      }).subscribe(updatedWorld => {
        if (updatedWorld) {
          this.world = updatedWorld;
          console.log('World info updated successfully');
        }
      });
    }
  }
  
  async addWorldElement(entityType: EntityType) {
    let newId: string;
    
    switch(entityType) {
      case 'event':
        console.log('Adding new event');
        await this.createEventAndGetId();
        newId = await this.createEventAndGetId();
        this.router.navigate(['/event', newId]);
        break;
      case 'location':
        console.log('Adding new location');
        newId = await this.createLocationAndGetId();
        this.router.navigate(['/location', newId]);
        break;
      case 'character':
        console.log('Adding new character');
        await this.createCharacterAndGetId();
        // newId = await this.createCharacterAndGetId();
        // this.router.navigate(['/character', newId]);
        break;
      case 'story':
        console.log('Adding new story');
        newId = await this.createStoryAndGetId();
        this.router.navigate(['/story', newId]);
        break;
      default:
        console.log(`Unknown entity type: ${entityType}`);
    }
  }
  
  private async createEventAndGetId(): Promise<string> {
    // Use the service to create a new event and get its ID
    const newEvent = {
      id: '',
      name: 'New Event',
      description: '',
      date: new Date().toISOString().split('T')[0], // Default to today
      location: [],
      characters: [],
      stories: [],
      tags: []
    } as WorldEventInfo;
    return this.eventService.createWorldEvent(newEvent, false).toPromise().then(event => {
      if (event) {
        console.log(`Created new event with id ${event.id}`);
        return event.id;
      } else {
        throw new Error('Failed to create event');
      }
    });
  }
  
 private async createLocationAndGetId(): Promise<string> {
    // Use the service to create a new location and get its ID
    const newLocation = {
      id: '',
      name: 'New Location',
      description: '',
      characters: [],
      stories: [],
      relatedLocations: [],
      tags: []
      } as WorldLocationInfo;
    return this.locationService.createWorldLocation(newLocation, false).toPromise().then(location => {
      if (location) {
        console.log(`Created new location with id ${location.id}`);
        return location.id;
      } else {
        throw new Error('Failed to create location');
      }
    });
  }
  
  private async createCharacterAndGetId(): Promise<string> {
    // Use the service to create a new character and get its ID
    const newChar = {
      id: '',
      personal_name: 'New',
      family_name: 'Character',
      altNames: [],
      physicalDescription: '',
      nonPhysicalDescription: '',
      pronouns: '',
      roles: [],
      affiliations: [],
      relationships: [],
      stories: [],
      tags: []
    } as WorldCharacterInfo;
    return this.characterService.createWorldCharacter(newChar, false).toPromise().then(character => {
      if (character) {
        console.log(`Created new character with id ${character.id}`);
        return character.id;
      } else {
        throw new Error('Failed to create character');
      }
    });
  }
  
  private async createStoryAndGetId(): Promise<string> {
    // Use the service to create a new story and get its ID
    const newStory = {
      id: '',
      title: 'New Story',
      description: '',
      characters: [],
      locations: [],
      substories: [],
      genre: [],
      tags: []
    } as WorldStoryInfo;
    return this.storyService.createWorldStory(newStory, false).toPromise().then(story => {
      if (story) {
        console.log(`Created new story with id ${story.id}`);
        return story.id;
      } else {
        throw new Error('Failed to create story');
      }
    });
  }
  
  onTagClick(tag: string) {
    console.log('Tag clicked:', tag);
    if (this.searchFilter) {
      this.searchFilter.addSearchTerm(tag);
    }
  }
}
