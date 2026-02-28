import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RelationshipList } from 'src/app/components/relationship-list/relationship-list';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';
import { WorldEventInfo, WorldEventService } from '../../services/world-event.service';
import { WorldLocationInfo, WorldLocationService } from '../../services/world-location.service';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { WorldStoryInfo, WorldStoryService } from '../../services/world-story.service';
import { Timeline } from '../../components/timeline/timeline/timeline';
import { AssociationList, AssociationItem, EntityType } from '../../components/association-list/association-list';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { EventThumbnail } from "src/app/components/thumbnail/event-thumbnail/event-thumbnail";

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule, Timeline, AssociationList, RelationshipList, RouterLink, EventThumbnail],
  templateUrl: "character-details.html",
  styleUrls: ["character-details.css", "../details.css", "../../../styles.css"],
})

export class WorldCharacterDetails implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  worldCharacterService = inject(WorldCharacterService);
  worldEventService = inject(WorldEventService);
  worldLocationService = inject(WorldLocationService);
  worldCharacter: WorldCharacterInfo | undefined;
  characterList = Array<WorldCharacterInfo>();
  filteredCharacterList = Array<WorldCharacterInfo>();
  storyFilter: string = 'all';
  worldStoryService = inject(WorldStoryService);
  storyList = Array<WorldStoryInfo>();
  locationList = Array<WorldLocationInfo>();
  eventList = Array<WorldEventInfo>();
  filteredEventList = Array<WorldEventInfo>();
  private routeSubscription: Subscription | undefined;

  // Date dropdown options
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  applyForm = new FormGroup({
    characterPersonalName: new FormControl(''),
    characterFamilyName: new FormControl(''),
    characterAltNames: new FormControl(''),
    characterPronouns: new FormControl(''),
    characterBirthYear: new FormControl(''),
    characterBirthMonth: new FormControl(''),
    characterBirthDay: new FormControl(''),
    characterDeathYear: new FormControl(''),
    characterDeathMonth: new FormControl(''),
    characterDeathDay: new FormControl(''),
    characterRoles: new FormControl(''),
    characterAffiliations: new FormControl(''),
    characterPhysicalDescription: new FormControl(''),
    characterNonPhysicalDescription: new FormControl(''),
    characterStories: new FormControl(''),
    characterTags: new FormControl(''),
    eventTags: new FormControl(''),
  });

  storyTitles: string[] = [];

  async ngOnInit() {
    // Subscribe to route parameter changes
    this.routeSubscription = this.route.params.subscribe(params => {
      const worldCharacterId = params['id']; // Keep as string
      this.loadCharacterData(worldCharacterId);
    });

    // Load shared data that doesn't depend on the current character
    this.loadSharedData();

    // Resolve story IDs to titles for display
    const allStories = await import('../../services/world-story.service').then(m => m.WorldStoryService.prototype.getAllWorldStories.call({url: '/worldstories'}));
    if (this.worldCharacter && this.worldCharacter.stories) {
      this.storyTitles = this.worldCharacter.stories.map(id => {
        const s = allStories.find((story: any) => story.id === id);
        return s ? s.title : id;
      });
    }
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private loadCharacterData(worldCharacterId: string) {
    this.worldCharacterService.getWorldCharacterById(worldCharacterId).then((worldCharacter) => {
      this.worldCharacter = worldCharacter;
      console.log('Loaded character data:', worldCharacter);
      
      // Parse birthdate into separate components
      const birthdate = worldCharacter?.birthdate || '';
      let birthYear = '', birthMonth = '', birthDay = '';
      if (birthdate) {
        const dateParts = birthdate.split('-');
        if (dateParts.length === 3) {
          birthYear = dateParts[0];
          birthMonth = this.getMonthName(parseInt(dateParts[1]));
          birthDay = parseInt(dateParts[2]).toString();
        }
      }

      // Parse deathdate into separate components
      const deathdate = worldCharacter?.deathdate || '';
      let deathYear = '', deathMonth = '', deathDay = '';
      if (deathdate) {
        const dateParts = deathdate.split('-');
        if (dateParts.length === 3) {
          deathYear = dateParts[0];
          deathMonth = this.getMonthName(parseInt(dateParts[1]));
          deathDay = parseInt(dateParts[2]).toString();
        }
      }

      this.applyForm.patchValue({
        characterPersonalName: worldCharacter?.personal_name || '',
        characterFamilyName: worldCharacter?.family_name || '',
        characterAltNames: worldCharacter?.alt_names?.join(', ') || '',
        characterPronouns: worldCharacter?.pronouns || '',
        characterBirthYear: birthYear,
        characterBirthMonth: birthMonth,
        characterBirthDay: birthDay,
        characterDeathYear: deathYear,
        characterDeathMonth: deathMonth,
        characterDeathDay: deathDay,
        characterRoles: worldCharacter?.roles?.join(', ') || '',
        characterAffiliations: worldCharacter?.affiliations?.join(', ') || '',
        characterPhysicalDescription: worldCharacter?.physical_description || '',
        characterNonPhysicalDescription: worldCharacter?.non_physical_description || '',
        characterStories: worldCharacter?.stories?.join(', ') || '',
        characterTags: worldCharacter?.tags?.join(', ') || '',
      });
      

      this.updateFilteredEvents();
    });

    console.log("Character data loaded for ID:", worldCharacterId);
    console.log("Current character state:", this.worldCharacter);
  }

  private loadSharedData() {
    this.worldCharacterService.getAllWorldCharacters().then((characters) => {
      this.characterList = characters;
      // this.applyFilters();
    });

    this.worldStoryService.getAllWorldStories().then((stories) => {
      this.storyList = stories;
    });

    this.worldLocationService.getAllWorldLocations().then((locations) => {
      this.locationList = locations;
    });

    this.worldEventService.getAllWorldEvents().then((events) => {
      this.eventList = events;
      this.updateFilteredEvents();
    });
  }

  getEvent(eventId: string | null): WorldEventInfo | null {
    console.log('a');
    return this.eventList.find(event => event.id === eventId) || null;
  }

  getUniqueStories(): string[] {
    const stories = new Set<string>();
    this.characterList.forEach(character => {
      if (character.stories) {
        character.stories.forEach(story => stories.add(story));
      }
    });
    return Array.from(stories).sort();
  }

  isLocationAssociatedWithCharacter(locationName: string): boolean {
    if (!this.worldCharacter) return false;
    return this.locationList.some(location => 
      location.name === locationName && 
      location.characters.includes(this.worldCharacter!.id)
    );
  }

  getCharacterLocations(): WorldLocationInfo[] {
    if (!this.worldCharacter) return [];
    return this.locationList.filter(location => 
      location.characters.includes(this.worldCharacter!.id)
    );
  }

  isStoryInCharacter(storyTitle: string): boolean {
    return this.worldCharacter?.stories?.includes(storyTitle) || false;
  }

  getStoriesAssociationList(): AssociationItem[] {
    return this.storyList.map(story => ({
      id: story.id,
      name: story.title,
      isAssociated: this.worldCharacter?.stories?.includes(story.id) || false
    }));
  }

  getLocationsAssociationList(): AssociationItem[] {
    return this.locationList.map(location => ({
      id: location.id,
      name: location.name,
      isAssociated: location.characters.includes(this.worldCharacter?.id || '')
    }));
  }

  onStoryToggle(event: {id: string, isChecked: boolean}) {
    const story = this.storyList.find(s => s.id === event.id);
    if (story && this.worldCharacter) {
      this.worldStoryService.getWorldStoryById(event.id).then((storyData) => {
        if (storyData) {
          let updatedCharacters = storyData.characters || [];
          if (event.isChecked) {
            if (!updatedCharacters.includes(this.worldCharacter!.id)) {
              updatedCharacters.push(this.worldCharacter!.id);
            }
          } else {
            updatedCharacters = updatedCharacters.filter(id => id !== this.worldCharacter!.id);
          }
          this.worldStoryService.updateWorldStory(
            storyData.id,
            storyData.title,
            storyData.description,
            updatedCharacters,
            storyData.locations || [],
            storyData.substories || [],
            storyData.tags || []
          );
        }
      });
    }
  }

  onLocationToggle(event: {id: string, isChecked: boolean}) {
    const location = this.locationList.find(l => l.id === event.id);
    if (location && this.worldCharacter) {
      this.worldLocationService.getWorldLocationById(event.id).then((locationData) => {
        if (locationData) {
          let updatedCharacters = locationData.characters || [];
          if (event.isChecked) {
            if (!updatedCharacters.includes(this.worldCharacter!.id)) {
              updatedCharacters.push(this.worldCharacter!.id);
            }
          } else {
            updatedCharacters = updatedCharacters.filter(id => id !== this.worldCharacter!.id);
          }
          this.worldLocationService.updateWorldLocation(
            locationData.id,
            locationData.name,
            locationData.description,
            updatedCharacters,
            locationData.stories,
            locationData.related_locations,
            locationData.tags
          );
        }
      });
    }
  }

  onStoryChange(event: Event, storyId: string) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      this.worldStoryService.getWorldStoryById(storyId).then((story) => {
        if (story && this.worldCharacter) {
          let updatedCharacters = story.characters || [];
          if (isChecked) {
            if (!updatedCharacters.includes(this.worldCharacter.id)) {
              updatedCharacters.push(this.worldCharacter.id);
            }
          } else {
            updatedCharacters = updatedCharacters.filter(id => id !== this.worldCharacter!.id);
          }
          this.worldStoryService.updateWorldStory(
            story.id,
            story.title,
            story.description,
            updatedCharacters,
            story.locations || [],
            story.substories || [],
            story.tags || []
          );
        }
      });
    }
  }

  onLocationChange(event: Event, locationId: string) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      this.worldLocationService.getWorldLocationById(locationId).then((location) => {
        if (location && this.worldCharacter) {
          let updatedCharacters = location.characters || [];
          if (isChecked) {
            if (!updatedCharacters.includes(this.worldCharacter.id)) {
              updatedCharacters.push(this.worldCharacter.id);
            }
          } else {
            updatedCharacters = updatedCharacters.filter(id => id !== this.worldCharacter!.id);
          }
          this.worldLocationService.updateWorldLocation(
            location.id,
            location.name,
            location.description,
            updatedCharacters,
            location.stories,
            location.related_locations,
            location.tags
          );
        }
      });
    }
  }

  getFormStories(): string[] {
    const stories: string[] = [];
    for (let story of this.storyList) {
      const checkbox = document.getElementById(`story-checkbox-${story.id}`) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        stories.push(story.id);
      }
    }
    return stories;
  }

  updateCharacter() {
    // console.log('Starting character update...');
    // console.log('Current character:', this.worldCharacter);
    if (!this.worldCharacter?.id) {
      console.error('No character ID found!');
      alert('Error: No character selected for update.');
      return;
    }

    const selectedStories = this.getFormStories();
    // Sync worldCharacter object with form values before saving
    this.worldCharacter.personal_name = this.applyForm.value.characterPersonalName ?? '';
    this.worldCharacter.family_name = this.applyForm.value.characterFamilyName ?? '';
    this.worldCharacter.alt_names = this.applyForm.value.characterAltNames?.split(', ').filter(name => name.trim() !== '') ?? [];
    const newBirthdate = this.formatBirthdate(
      this.applyForm.value.characterBirthYear || '',
      this.applyForm.value.characterBirthMonth || '',
      this.applyForm.value.characterBirthDay || ''
    );
    const newDeathdate = this.formatBirthdate(
      this.applyForm.value.characterDeathYear || '',
      this.applyForm.value.characterDeathMonth || '',
      this.applyForm.value.characterDeathDay || ''
    );
    // const prevBirthdate = this.worldCharacter.birthdate;
    // const prevDeathdate = this.worldCharacter.deathdate;
    this.worldCharacter.birthdate = newBirthdate;
    this.worldCharacter.deathdate = newDeathdate;
    this.worldCharacter.pronouns = this.applyForm.value.characterPronouns ?? '';
    this.worldCharacter.roles = this.applyForm.value.characterRoles?.split(', ').filter(role => role.trim() !== '') ?? [];
    this.worldCharacter.affiliations = this.applyForm.value.characterAffiliations?.split(', ').filter(aff => aff.trim() !== '') ?? [];
    this.worldCharacter.physical_description = this.applyForm.value.characterPhysicalDescription ?? '';
    this.worldCharacter.non_physical_description = this.applyForm.value.characterNonPhysicalDescription ?? '';
    this.worldCharacter.stories = selectedStories;
    this.worldCharacter.tags = this.applyForm.value.characterTags?.split(', ').filter(tag => tag.trim() !== '') ?? [];

    const formattedBirthdate = this.worldCharacter.birthdate || '';
    const formattedDeathdate = this.worldCharacter.deathdate || '';

    try {
      const result = this.worldCharacterService.updateWorldCharacter(
        this.worldCharacter.id,
        this.worldCharacter.personal_name,
        this.worldCharacter.family_name,
        this.worldCharacter.alt_names,
        formattedBirthdate,
        this.worldCharacter.birth_event ?? null,
        formattedDeathdate,
        this.worldCharacter.death_event ?? null,
        this.worldCharacter.pronouns,
        this.worldCharacter.roles,
        this.worldCharacter.affiliations,
        this.worldCharacter.physical_description,
        this.worldCharacter.non_physical_description,
        this.worldCharacter.stories,
        this.worldCharacter.tags
      );
      // console.log('Character update called successfully', result);

      if (result && typeof result.then === 'function') {
        result.then(() => {
          console.log('Character update completed successfully');
          // alert('Character updated successfully!');
        }).catch((error: any) => {
          console.error('Character update promise failed:', error);
          alert('Failed to update character: ' + error.message);
        });
      }
    } catch (error) {
      console.error('Error updating character:', error);
      alert('Failed to update character: ' + (error as Error).message);
    }

    // Ensure all story records are updated to reflect their association with this character
    for (let story of this.storyList) {
      const isSelected = selectedStories.includes(story.id);
      this.worldStoryService.getWorldStoryById(story.id).then((fullStory) => {
        if (fullStory && this.worldCharacter) {
          let updatedCharacters = fullStory.characters || [];
          const hasCharacter = updatedCharacters.includes(this.worldCharacter.id);
          if (isSelected && !hasCharacter) {
            updatedCharacters.push(this.worldCharacter.id);
            this.updateStoryCharacters(story, fullStory, updatedCharacters);
          } else if (!isSelected && hasCharacter) {
            updatedCharacters = updatedCharacters.filter(id => id !== this.worldCharacter!.id);
            this.updateStoryCharacters(story, fullStory, updatedCharacters);
          }
        }
      });
    }
  }
  
  private updateStoryCharacters(story: WorldStoryInfo, fullStory: WorldStoryInfo, updatedCharacters: string[]) {
    this.worldStoryService.updateWorldStory(
      story.id,
      fullStory.title,
      fullStory.description,
      updatedCharacters,
      fullStory.locations || [],
      fullStory.substories || [],
      fullStory.tags || []
    );
  }

  deleteCharacter() {
    if (this.worldCharacter?.id && confirm(`Are you sure you want to delete ${this.worldCharacter.personal_name} ${this.worldCharacter.family_name}? This action cannot be undone.`)) {
      this.worldCharacterService.deleteWorldCharacter(this.worldCharacter.id);
      this.router.navigate(['/character']);
    }
  }

  // Helper methods for birthdate handling
  private getMonthName(monthNumber: number): string {
    if (monthNumber >= 1 && monthNumber <= 12) {
      return this.months[monthNumber - 1];
    }
    return '';
  }

  private getMonthNumber(monthName: string): number {
    const index = this.months.indexOf(monthName);
    return index >= 0 ? index + 1 : 0;
  }

  private updateFilteredEvents() {
    if (!this.worldCharacter || this.eventList.length === 0) {
      this.filteredEventList = [];
      return;
    }

    const characterId = this.worldCharacter.id;
    this.filteredEventList = this.eventList.filter(event => 
      event.characters.includes(characterId)
    );
  }

  async addCharacterEvent(eventType: string) {
    const eventTagsInput = this.applyForm.value.eventTags || '';
    const tags = eventTagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const characterName = `${this.worldCharacter?.personal_name} ${this.worldCharacter?.family_name}`;
    const characterId = this.worldCharacter?.id || '';
    let date = '';
    if (!this.worldCharacter) {
      alert('No character selected.');
      return;
    }
    if (eventType === 'birth') {
      date = this.formatBirthdate(
        this.applyForm.value.characterBirthYear || '',
        this.applyForm.value.characterBirthMonth || '',
        this.applyForm.value.characterBirthDay || ''
      );
    } else if (eventType === 'death') {
      date = this.formatBirthdate(
        this.applyForm.value.characterDeathYear || '',
        this.applyForm.value.characterDeathMonth || '',
        this.applyForm.value.characterDeathDay || ''
      );
    }
    if (!date) {
      alert('Please provide a valid date before adding to the timeline.');
      return;
    }

    // Use explicit property access for eventId
    let eventId: string | undefined = undefined;
    if (eventType === 'birth') {
      eventId = this.worldCharacter.birth_event;
    } else if (eventType === 'death') {
      eventId = this.worldCharacter.death_event;
    }
    let eventTitle = `${characterName}'s ${eventType === 'birth' ? 'Birth' : 'Death'}`;
    let eventDescription = `${characterName}'s ${eventType === 'birth' ? 'birth' : 'death'}.`;
    let eventCharacters = [characterId];
    let eventStories = this.worldCharacter.stories || [];
    let eventTags = [...tags, eventType === 'birth' ? 'birth' : 'death'];

    try {
      if (eventId) {
        // Update existing event
        const existingEvent = await this.worldEventService.getWorldEventById(eventId);
        this.worldEventService.updateWorldEvent(
          eventId,
          eventTitle,
          date,
          '',
          existingEvent?.description || eventDescription,
          existingEvent?.location || [],
          existingEvent?.characters || eventCharacters,
          existingEvent?.stories || eventStories,
          existingEvent?.tags || eventTags
        );
        // Also update the character's date in the database
        if (eventType === 'birth') {
          this.worldCharacter.birthdate = date;
        } else if (eventType === 'death') {
          this.worldCharacter.deathdate = date;
        }
        await this.worldCharacterService.updateWorldCharacter(
          this.worldCharacter.id,
          this.worldCharacter.personal_name,
          this.worldCharacter.family_name,
          this.worldCharacter.alt_names,
          this.worldCharacter.birthdate || '',
          this.worldCharacter.birth_event || null,
          this.worldCharacter.deathdate || '',
          this.worldCharacter.death_event || null,
          this.worldCharacter.pronouns,
          this.worldCharacter.roles,
          this.worldCharacter.affiliations,
          this.worldCharacter.physical_description,
          this.worldCharacter.non_physical_description,
          this.worldCharacter.stories,
          this.worldCharacter.tags
        );
        console.log(`Updated ${eventType} event with id ${eventId} and updated character date.`);
      } else {
        // Create new event
        const newEvent = await this.worldEventService.createWorldEvent(
          {
            id: '',
            name: eventTitle,
            date: date,
            description: eventDescription,
            location: [],
            characters: eventCharacters,
            stories: eventStories,
            tags: eventTags
          } as WorldEventInfo,
          true
        ).toPromise();
        // Update the character with the new eventId and date
        if (eventType === 'birth') {
          this.worldCharacter.birth_event = newEvent?.id;
          this.worldCharacter.birthdate = date;
        } else if (eventType === 'death') {
          this.worldCharacter.death_event = newEvent?.id;
          this.worldCharacter.deathdate = date;
        }
        await this.worldCharacterService.updateWorldCharacter(
          this.worldCharacter.id,
          this.worldCharacter.personal_name,
          this.worldCharacter.family_name,
          this.worldCharacter.alt_names,
          this.worldCharacter.birthdate || '',
          this.worldCharacter.birth_event || null,
          this.worldCharacter.deathdate || '',
          this.worldCharacter.death_event || null,
          this.worldCharacter.pronouns,
          this.worldCharacter.roles,
          this.worldCharacter.affiliations,
          this.worldCharacter.physical_description,
          this.worldCharacter.non_physical_description,
          this.worldCharacter.stories,
          this.worldCharacter.tags
        );
      }
      this.updateFilteredEvents();
    } catch (error: any) {
      console.error('Failed to add/update event to timeline:', error);
      alert('Failed to add/update event to timeline: ' + error.message);
    }
  }

  onTimelineTagClicked(tag: string) {
    console.log('Timeline tag clicked:', tag);
    this.router.navigate(['/events'], { queryParams: { tag: tag } });
    // You can implement tag filtering logic here if needed
  }

  private formatBirthdate(year: string, monthName: string, day: string): string {
    // Allow empty birthdate
    if (!year && !monthName && !day) {
      return '';
    }
    
    // If any part is missing, return empty string
    if (!year || !monthName || !day) {
      return '';
    }
    
    const monthNumber = this.getMonthNumber(monthName);
    if (monthNumber === 0) {
      return '';
    }
    
    // Ensure day is a valid number
    const dayNumber = parseInt(day);
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
      return '';
    }
    
    const paddedMonth = monthNumber < 10 ? '0' + monthNumber : monthNumber.toString();
    const paddedDay = dayNumber < 10 ? '0' + dayNumber : dayNumber.toString();
    
    return `${year}-${paddedMonth}-${paddedDay}`;
  }
}
