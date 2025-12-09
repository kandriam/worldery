import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule, RouterLink, Timeline, AssociationList],
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
    characterRoles: new FormControl(''),
    characterAffiliations: new FormControl(''),
    characterRelationships: new FormControl(''),
    characterPhysicalDescription: new FormControl(''),
    characterNonPhysicalDescription: new FormControl(''),
    characterStories: new FormControl(''),
    characterTags: new FormControl(''),
    eventTags: new FormControl(''),
  });

  constructor() {
    // Moved initialization logic to ngOnInit
  }

  ngOnInit() {
    // Subscribe to route parameter changes
    this.routeSubscription = this.route.params.subscribe(params => {
      const worldCharacterId = params['id']; // Keep as string
      this.loadCharacterData(worldCharacterId);
    });

    // Load shared data that doesn't depend on the current character
    this.loadSharedData();
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
      let year = '', month = '', day = '';
      
      if (birthdate) {
        const dateParts = birthdate.split('-');
        if (dateParts.length === 3) {
          year = dateParts[0];
          month = this.getMonthName(parseInt(dateParts[1]));
          day = parseInt(dateParts[2]).toString();
        }
      }
      
      this.applyForm.patchValue({
        characterFirstName: worldCharacter?.firstName || '',
        characterLastName: worldCharacter?.lastName || '',
        characterAltNames: worldCharacter?.altNames?.join(', ') || '',
        characterPronouns: worldCharacter?.pronouns || '',
        characterBirthYear: year,
        characterBirthMonth: month,
        characterBirthDay: day,
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
    const characterName = `${this.worldCharacter.firstName} ${this.worldCharacter.lastName}`;
    return this.locationList.some(location => 
      location.name === locationName && 
      location.characters.includes(characterName)
    );
  }

  getCharacterLocations(): WorldLocationInfo[] {
    if (!this.worldCharacter) return [];
    const characterName = `${this.worldCharacter.firstName} ${this.worldCharacter.lastName}`;
    return this.locationList.filter(location => 
      location.characters.includes(characterName)
    );
  }

  isStoryInCharacter(storyTitle: string): boolean {
    return this.worldCharacter?.stories?.includes(storyTitle) || false;
  }

  getStoriesAssociationList(): AssociationItem[] {
    return this.storyList.map(story => ({
      id: story.id,
      name: story.title,
      isAssociated: this.isStoryInCharacter(story.title)
    }));
  }

  getLocationsAssociationList(): AssociationItem[] {
    return this.locationList.map(location => ({
      id: location.id,
      name: location.name,
      isAssociated: this.isLocationAssociatedWithCharacter(location.name)
    }));
  }

  onStoryToggle(event: {id: string, isChecked: boolean}) {
    const story = this.storyList.find(s => s.id === event.id);
    if (story && this.worldCharacter) {
      const characterName = `${this.worldCharacter.firstName} ${this.worldCharacter.lastName}`;
      
      this.worldStoryService.getWorldStoryById(event.id).then((storyData) => {
        if (storyData) {
          let updatedCharacters = storyData.characters || [];
          
          if (event.isChecked) {
            if (!updatedCharacters.includes(characterName)) {
              updatedCharacters.push(characterName);
            }
          } else {
            updatedCharacters = updatedCharacters.filter(char => char !== characterName);
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
      const characterName = `${this.worldCharacter.firstName} ${this.worldCharacter.lastName}`;
      
      this.worldLocationService.getWorldLocationById(event.id).then((locationData) => {
        if (locationData) {
          let updatedCharacters = locationData.characters || [];
          
          if (event.isChecked) {
            if (!updatedCharacters.includes(characterName)) {
              updatedCharacters.push(characterName);
            }
          } else {
            updatedCharacters = updatedCharacters.filter(char => char !== characterName);
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
    let relationshipCheckbox = document.getElementById(`relationship-checkbox-${characterID}`) as HTMLInputElement;
    let isChecked = relationshipCheckbox.checked;
    let relationshipTypeInput = document.getElementById(`relationship-type-${characterID}`) as HTMLInputElement;
    let relationshipTypes = relationshipTypeInput.value.split(',').map(type => type.trim());
    let relationshipDescription = document.getElementById(`relationship-description-${characterID}`) as HTMLTextAreaElement;
    let descriptionText = relationshipDescription.value;
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
      const characterName = `${this.worldCharacter?.firstName} ${this.worldCharacter?.lastName}`;
      
      this.worldStoryService.getWorldStoryById(storyId).then((story) => {
        if (story) {
          console.log(`Story ${story.title} ${isChecked ? 'added to' : 'removed from'} character`);
          
          // Update the story's characters list
          let updatedCharacters = story.characters || [];
          
          if (isChecked) {
            // Add character if not already present
            if (!updatedCharacters.includes(characterName)) {
              updatedCharacters.push(characterName);
            }
          } else {
            // Remove character if present
            updatedCharacters = updatedCharacters.filter(char => char !== characterName);
          }
          
          // Update the story with the new characters list
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
      const characterName = `${this.worldCharacter?.firstName} ${this.worldCharacter?.lastName}`;
      
      this.worldLocationService.getWorldLocationById(locationId).then((location) => {
        if (location) {
          console.log(`Location ${location.name} ${isChecked ? 'associated with' : 'disassociated from'} character`);
          
          // Update the location's characters list
          let updatedCharacters = location.characters || [];
          
          if (isChecked) {
            // Add character if not already present
            if (!updatedCharacters.includes(characterName)) {
              updatedCharacters.push(characterName);
            }
          } else {
            // Remove character
            updatedCharacters = updatedCharacters.filter(char => char !== characterName);
          }
          
          // Update the location
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
        stories.push(story.title);
      }
    }
    return stories;
  }

  updateCharacter() {
    console.log('Starting character update...');
    console.log('Current character:', this.worldCharacter);
    
    if (!this.worldCharacter?.id) {
      console.error('No character ID found!');
      alert('Error: No character selected for update.');
      return;
    }
    
    let relationships: worldCharacterRelationship[] = [];
    for (let character of this.characterList) {
      if (character.id !== this.worldCharacter?.id) {
        // Check if this character is currently displayed (has DOM elements)
        let relationshipCheckbox = document.getElementById(`relationship-checkbox-${character.id}`) as HTMLInputElement;
        
        if (relationshipCheckbox) {
          // Character is displayed, get form data
          let updatedRelationship = this.getFormRelationship(character.id);
          if (updatedRelationship) {
            relationships.push(updatedRelationship);
          }
        } else {
          // Character is not displayed, preserve existing relationship data
          let existingRelationship = this.getRelationship(character.id);
          if (existingRelationship) {
            relationships.push(existingRelationship);
          }
        }
      }
    }
    
    const selectedStories = this.getFormStories();
    const characterName = `${this.worldCharacter?.firstName} ${this.worldCharacter?.lastName}`;
    
    if (this.worldCharacter?.id !== undefined) {
      const formattedBirthdate = this.formatBirthdate(
        this.applyForm.value.characterBirthYear || '',
        this.applyForm.value.characterBirthMonth || '',
        this.applyForm.value.characterBirthDay || ''
      );
      
      console.log('Form data:', {
        id: this.worldCharacter.id,
        firstName: this.applyForm.value.characterFirstName,
        lastName: this.applyForm.value.characterLastName,
        birthdate: formattedBirthdate,
        pronouns: this.applyForm.value.characterPronouns,
        relationships: relationships.length
      });
      
      try {
        const result = this.worldCharacterService.updateWorldCharacter(
          this.worldCharacter.id,
          this.applyForm.value.characterFirstName ?? '',
          this.applyForm.value.characterLastName ?? '',
          this.applyForm.value.characterAltNames?.split(', ').filter(name => name.trim() !== '') ?? [],
          formattedBirthdate,
          this.applyForm.value.characterPronouns ?? '',
          this.applyForm.value.characterRoles?.split(', ').filter(role => role.trim() !== '') ?? [],
          this.applyForm.value.characterAffiliations?.split(', ').filter(aff => aff.trim() !== '') ?? [],
          relationships,
          this.applyForm.value.characterPhysicalDescription ?? '',
          this.applyForm.value.characterNonPhysicalDescription ?? '',
          selectedStories,
          this.applyForm.value.characterTags?.split(', ').filter(tag => tag.trim() !== '') ?? [],
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
        const isSelected = selectedStories.includes(story.title);
        
        this.worldStoryService.getWorldStoryById(story.id).then((fullStory) => {
          if (fullStory) {
            let updatedCharacters = fullStory.characters || [];
            const hasCharacter = updatedCharacters.includes(characterName);
            
            if (isSelected && !hasCharacter) {
              // Add character if selected but not in story's list
              updatedCharacters.push(characterName);
              this.updateStoryCharacters(story, fullStory, updatedCharacters);
            } else if (!isSelected && hasCharacter) {
              // Remove character if not selected but in story's list
              updatedCharacters = updatedCharacters.filter(char => char !== characterName);
              this.updateStoryCharacters(story, fullStory, updatedCharacters);
            }
          }
        });
      }
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

    const characterName = `${this.worldCharacter.firstName} ${this.worldCharacter.lastName}`;
    
    this.filteredEventList = this.eventList.filter(event => 
      event.characters.includes(characterName)
    );
  }

  onTimelineTagClicked(tag: string) {
    console.log('Timeline tag clicked:', tag);
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
