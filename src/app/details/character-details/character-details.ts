import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorldCharacterService } from '../../services/world-character.service';
import { WorldEventService } from '../../services/world-event.service';
import { WorldLocationService } from '../../services/world-location.service';
import { WorldCharacterInfo, worldCharacterRelationship } from '../../worldcharacter';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { WorldStoryInfo } from '../../worldstory';
import { WorldEventInfo } from '../../worldevent';
import { WorldLocationInfo } from '../../worldlocation';
import { WorldStoryService } from '../../services/world-story.service';
import { Timeline } from '../../components/timeline/timeline/timeline';
import { AssociationList, AssociationItem, EntityType } from '../../components/association-list/association-list';
import { RelationshipList } from '../../components/relationship-list/relationship-list';
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
  relationshipFilter: 'all' | 'with-relationship' | 'without-relationship' = 'with-relationship';
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
    characterFirstName: new FormControl(''),
    characterLastName: new FormControl(''),
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
    characterRelationships: new FormControl(''),
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
        characterFirstName: worldCharacter?.firstName || '',
        characterLastName: worldCharacter?.lastName || '',
        characterAltNames: worldCharacter?.altNames?.join(', ') || '',
        characterPronouns: worldCharacter?.pronouns || '',
        characterBirthYear: birthYear,
        characterBirthMonth: birthMonth,
        characterBirthDay: birthDay,
        characterDeathYear: deathYear,
        characterDeathMonth: deathMonth,
        characterDeathDay: deathDay,
        characterRoles: worldCharacter?.roles?.join(', ') || '',
        characterAffiliations: worldCharacter?.affiliations?.join(', ') || '',
        characterRelationships: worldCharacter?.relationships?.join(', ') || '',
        characterPhysicalDescription: worldCharacter?.physicalDescription || '',
        characterNonPhysicalDescription: worldCharacter?.nonPhysicalDescription || '',
        characterStories: worldCharacter?.stories?.join(', ') || '',
        characterTags: worldCharacter?.tags?.join(', ') || '',
      });
      
      // Update relationship checkboxes after character data loads
      this.updateRelationshipUI();
      // Update filtered events after character data loads
      this.updateFilteredEvents();
    });

    console.log("Character data loaded for ID:", worldCharacterId);
  }

  private loadSharedData() {
    this.worldCharacterService.getAllWorldCharacters().then((characters) => {
      this.characterList = characters;
      this.applyFilters();
      this.updateRelationshipUI();
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

  private updateRelationshipUI() {
    if (this.characterList.length > 0 && this.worldCharacter) {
      for (let character of this.characterList) {
        if (this.getRelationship(character.id)?.hasRelationship == true) {
          let element = document.getElementById(`relationship-description-${character.id}`) as HTMLElement;
          console.log(element);
          // element.classList.remove('hidden');
          // console.log(`Relationship between ${this.worldCharacter?.firstName} and ${character.firstName}:`, this.getRelationship(character.id));
        }
      }
    }
  }

  toggleRelationship(event: Event, characterId: string) {
    console.log(`Toggling relationship for character ID: ${characterId}`);
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Checkbox is now: ${isChecked}`);
      let relationshipDescription = document.getElementById(`relationship-description-${characterId}`) as HTMLTextAreaElement;
      let relationshipType = document.getElementById(`relationship-type-${characterId}`) as HTMLInputElement;
      if (isChecked) {
        relationshipDescription.classList.remove('hidden');
        relationshipType.classList.remove('hidden');
    }
    else {
        relationshipDescription.classList.add('hidden');
        relationshipType.classList.add('hidden');
      }
    }
  }

  getRelationship(characterID: string): worldCharacterRelationship | undefined {
    return this.worldCharacter?.relationships?.find(r => r.relatedCharacterID === characterID.toString());
  }

  // Filter methods
  applyFilters(): void {
    if (!this.characterList || !this.worldCharacter) {
      this.filteredCharacterList = [];
      return;
    }

    this.filteredCharacterList = this.characterList.filter(character => {
      if (character.id === this.worldCharacter?.id) return false;

      // Relationship filter
      const hasRelationship = this.getRelationship(character.id)?.hasRelationship;
      if (this.relationshipFilter === 'with-relationship' && !hasRelationship) return false;
      if (this.relationshipFilter === 'without-relationship' && hasRelationship) return false;

      // Story filter
      if (this.storyFilter !== 'all') {
        const characterStories = character.stories || [];
        if (!characterStories.includes(this.storyFilter)) return false;
      }

      return true;
    });
  }

  setRelationshipFilter(filter: 'all' | 'with-relationship' | 'without-relationship'): void {
    this.relationshipFilter = filter;
    this.applyFilters();
  }

  setStoryFilter(story: string): void {
    this.storyFilter = story;
    this.applyFilters();
  }

  onStoryFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.setStoryFilter(select?.value || 'all');
  }

  getEvent(eventId: string): WorldEventInfo | undefined {
    return this.eventList.find(event => event.id === eventId);
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

  onRelationshipsChanged(updated: worldCharacterRelationship[]) {
    if (this.worldCharacter) {
      this.worldCharacter.relationships = updated;
      // Save immediately
      this.worldCharacterService.updateWorldCharacter(
        this.worldCharacter.id,
        this.worldCharacter.firstName,
        this.worldCharacter.lastName,
        this.worldCharacter.altNames,
        this.worldCharacter.birthdate || '',
        this.worldCharacter.birthEventId || '',
        this.worldCharacter.deathdate || '',
        this.worldCharacter.deathEventId || '',
        this.worldCharacter.pronouns,
        this.worldCharacter.roles,
        this.worldCharacter.affiliations,
        this.worldCharacter.relationships,
        this.worldCharacter.physicalDescription,
        this.worldCharacter.nonPhysicalDescription,
        this.worldCharacter.stories,
        this.worldCharacter.tags
      );
    }
  }
  // Relationship component event handlers
  onRelationshipToggled(event: {event: Event, characterId: string}) {
    this.toggleRelationship(event.event, event.characterId);
  }

  onRelationshipFilterChanged(filter: 'all' | 'with-relationship' | 'without-relationship') {
    this.setRelationshipFilter(filter);
  }

  onStoryFilterChanged(story: string) {
    this.setStoryFilter(story);
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
            locationData.relatedLocations,
            locationData.tags
          );
        }
      });
    }
  }

  onRelationshipChange(event: Event, characterId: string) {
    this.worldCharacterService.getWorldCharacterById(characterId).then((character) => {
      if (event.target instanceof HTMLInputElement) {
        const isChecked = event.target.checked;
        console.log(`Checkbox is now: ${isChecked}`);
        if (isChecked) {
          console.log(`Adding relationship to: ${character?.firstName} ${character?.lastName}`);
          // Additional logic to add relationship can be added here
          // this.worldCharacterService.updateCharacterRelationship()
        } else {
          console.log(`Removing relationship to: ${character?.firstName} ${character?.lastName}`);
          // Additional logic to remove relationship can be added here
        }
      }
    });
  }

  getFormRelationship(characterID: string): worldCharacterRelationship | undefined {
    const relationshipCheckbox = document.getElementById(`relationship-checkbox-${characterID}`) as HTMLInputElement | null;
    const relationshipTypeInput = document.getElementById(`relationship-type-${characterID}`) as HTMLInputElement | null;
    const relationshipDescription = document.getElementById(`relationship-description-${characterID}`) as HTMLTextAreaElement | null;
    if (!relationshipCheckbox || !relationshipTypeInput || !relationshipDescription) {
      // If any element is missing, skip this relationship
      return undefined;
    }
    const isChecked = relationshipCheckbox.checked;
    const relationshipTypes = relationshipTypeInput.value.split(',').map(type => type.trim());
    const descriptionText = relationshipDescription.value;
    console.log(`RelatedCharacterID: ${characterID}, HasRelationship: ${isChecked}, RelationshipDescription: ${descriptionText}`);
    return {
      relatedCharacterID: characterID.toString(),
      relationshipType: relationshipTypes,
      hasRelationship: isChecked,
      relationshipDescription: descriptionText
    };
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
            location.relatedLocations,
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
    console.log('Starting character update...');
    console.log('Current character:', this.worldCharacter);
    console.log('a');
    if (!this.worldCharacter?.id) {
      console.error('No character ID found!');
      alert('Error: No character selected for update.');
      return;
    }
    console.log('b');

    // Rebuild relationships array from UI to ensure latest type/details are saved
    let relationships: worldCharacterRelationship[] = [];
    if (this.characterList && this.characterList.length > 0) {
      for (let character of this.characterList) {
        if (character.id !== this.worldCharacter?.id) {
          const rel = this.getFormRelationship(character.id);
          if (rel && rel.hasRelationship) {
            console.log('Adding relationship from form:', rel);
            relationships.push({
              relatedCharacterID: rel.relatedCharacterID,
              hasRelationship: rel.hasRelationship,
              relationshipType: rel.relationshipType,
              relationshipDescription: rel.relationshipDescription
            });
          }
        }
      }
    }
    console.log('!');

    const selectedStories = this.getFormStories();
    console.log('!!')
    // Sync worldCharacter object with form values before saving
    this.worldCharacter.firstName = this.applyForm.value.characterFirstName ?? '';
    this.worldCharacter.lastName = this.applyForm.value.characterLastName ?? '';
    this.worldCharacter.altNames = this.applyForm.value.characterAltNames?.split(', ').filter(name => name.trim() !== '') ?? [];
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
    const prevBirthdate = this.worldCharacter.birthdate;
    const prevDeathdate = this.worldCharacter.deathdate;
    this.worldCharacter.birthdate = newBirthdate;
    this.worldCharacter.deathdate = newDeathdate;
    this.worldCharacter.pronouns = this.applyForm.value.characterPronouns ?? '';
    this.worldCharacter.roles = this.applyForm.value.characterRoles?.split(', ').filter(role => role.trim() !== '') ?? [];
    this.worldCharacter.affiliations = this.applyForm.value.characterAffiliations?.split(', ').filter(aff => aff.trim() !== '') ?? [];
    this.worldCharacter.relationships = relationships;
    this.worldCharacter.physicalDescription = this.applyForm.value.characterPhysicalDescription ?? '';
    this.worldCharacter.nonPhysicalDescription = this.applyForm.value.characterNonPhysicalDescription ?? '';
    this.worldCharacter.stories = selectedStories;
    this.worldCharacter.tags = this.applyForm.value.characterTags?.split(', ').filter(tag => tag.trim() !== '') ?? [];

    const characterName = `${this.worldCharacter.firstName} ${this.worldCharacter.lastName}`;

    const formattedBirthdate = this.worldCharacter.birthdate || '';
    const formattedDeathdate = this.worldCharacter.deathdate || '';
    console.log('!!!!');
    console.log('Form data:', {
      id: this.worldCharacter.id,
      firstName: this.worldCharacter.firstName,
      lastName: this.worldCharacter.lastName,
      birthdate: formattedBirthdate,
      deathdate: formattedDeathdate,
      pronouns: this.worldCharacter.pronouns,
      relationships: relationships.length
    });

    try {
      const result = this.worldCharacterService.updateWorldCharacter(
        this.worldCharacter.id,
        this.worldCharacter.firstName,
        this.worldCharacter.lastName,
        this.worldCharacter.altNames,
        formattedBirthdate,
        this.worldCharacter.birthEventId ?? '',
        formattedDeathdate,
        this.worldCharacter.deathEventId ?? '',
        this.worldCharacter.pronouns,
        this.worldCharacter.roles,
        this.worldCharacter.affiliations,
        this.worldCharacter.relationships,
        this.worldCharacter.physicalDescription,
        this.worldCharacter.nonPhysicalDescription,
        this.worldCharacter.stories,
        this.worldCharacter.tags
      );
      console.log('Character update called successfully', result);

      if (result && typeof result.then === 'function') {
        result.then(() => {
          console.log('Character update completed successfully');
          // alert('Character updated successfully!');
          window.location.reload();
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

    if (newBirthdate && newBirthdate !== prevBirthdate) {
      this.addCharacterEvent('birth');
    }
    if (newDeathdate && newDeathdate !== prevDeathdate) {
      this.addCharacterEvent('death');
    }
  }
  
  private updateStoryCharacters(story: WorldStoryInfo, fullStory: WorldStoryInfo, updatedCharacters: string[]) {
    this.worldStoryService.updateWorldStory(
      story.id,
      fullStory.title,
      fullStory.description,
      updatedCharacters,
      fullStory.locations || [],
      fullStory.tags || []
    );
  }

  deleteCharacter() {
    if (this.worldCharacter?.id && confirm(`Are you sure you want to delete ${this.worldCharacter.firstName} ${this.worldCharacter.lastName}? This action cannot be undone.`)) {
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
    const characterName = `${this.worldCharacter?.firstName} ${this.worldCharacter?.lastName}`;
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
      // alert('Please provide a valid date before adding to the timeline.');
      return;
    }

    // Use explicit property access for eventId
    let eventId: string | undefined = undefined;
    if (eventType === 'birth') {
      eventId = this.worldCharacter.birthEventId;
    } else if (eventType === 'death') {
      eventId = this.worldCharacter.deathEventId;
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
          this.worldCharacter.firstName,
          this.worldCharacter.lastName,
          this.worldCharacter.altNames,
          this.worldCharacter.birthdate || '',
          this.worldCharacter.birthEventId || '',
          this.worldCharacter.deathdate || '',
          this.worldCharacter.deathEventId || '',
          this.worldCharacter.pronouns,
          this.worldCharacter.roles,
          this.worldCharacter.affiliations,
          this.worldCharacter.relationships,
          this.worldCharacter.physicalDescription,
          this.worldCharacter.nonPhysicalDescription,
          this.worldCharacter.stories,
          this.worldCharacter.tags
        );
        console.log(`Updated ${eventType} event with id ${eventId} and updated character date.`);
      } else {
        // Create new event
        const newEventId = await this.worldEventService.createWorldEvent(
          eventTitle,
          date,
          '',
          eventDescription,
          [],
          eventCharacters,
          eventStories,
          eventTags,
          false
        );
        // Update the character with the new eventId and date
        if (eventType === 'birth') {
          this.worldCharacter.birthEventId = newEventId;
          this.worldCharacter.birthdate = date;
        } else if (eventType === 'death') {
          this.worldCharacter.deathEventId = newEventId;
          this.worldCharacter.deathdate = date;
        }
        await this.worldCharacterService.updateWorldCharacter(
          this.worldCharacter.id,
          this.worldCharacter.firstName,
          this.worldCharacter.lastName,
          this.worldCharacter.altNames,
          this.worldCharacter.birthdate || '',
          this.worldCharacter.birthEventId || '',
          this.worldCharacter.deathdate || '',
          this.worldCharacter.deathEventId || '',
          this.worldCharacter.pronouns,
          this.worldCharacter.roles,
          this.worldCharacter.affiliations,
          this.worldCharacter.relationships,
          this.worldCharacter.physicalDescription,
          this.worldCharacter.nonPhysicalDescription,
          this.worldCharacter.stories,
          this.worldCharacter.tags
        );
        console.log(`Created new ${eventType} event with id ${newEventId} and updated character.`);
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
