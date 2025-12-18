import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorldStoryService } from '../../services/world-story.service';
import { WorldEventService } from '../../services/world-event.service';
import { WorldStoryInfo } from '../../worldstory';
import { WorldCharacterService } from '../../services/world-character.service';
import { WorldCharacterInfo } from '../../worldcharacter';
import { WorldLocationService } from '../../services/world-location.service';
import { WorldLocationInfo } from '../../worldlocation';
import { WorldEventInfo } from '../../worldevent';
import { Timeline } from '../../components/timeline/timeline/timeline';
import { AssociationList, AssociationItem, EntityType } from '../../components/association-list/association-list';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { Subscription } from 'rxjs';
import { SubstoryList } from "src/app/components/substory-list/substory-list";

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule, Timeline, AssociationList, SubstoryList],
  templateUrl: 'story-details.html',
  styleUrls: ["story-details.css", "../details.css", "../../../styles.css"],
})

export class WorldStoryDetails implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  worldStoryService = inject(WorldStoryService);
  worldEventService = inject(WorldEventService);
  worldCharacterService = inject(WorldCharacterService);
  worldLocationService = inject(WorldLocationService);
  worldStory: WorldStoryInfo | undefined;
  characterList = Array<WorldCharacterInfo>();
  locationList = Array<WorldLocationInfo>();
  eventList = Array<WorldEventInfo>();
  storyList = Array<WorldStoryInfo>();
  filteredEventList = Array<WorldEventInfo>();
  private routeSubscription: Subscription | undefined;

  applyForm = new FormGroup({
    storyTitle: new FormControl(''),
    storyDate: new FormControl(''),
    storyDescription: new FormControl(''),
    storyCharacters: new FormControl(''),
    storyLocations: new FormControl(''),
    storyTags: new FormControl(''),
  });

  constructor() {
    // Moved initialization logic to ngOnInit
  }

  ngOnInit() {
    // Subscribe to route parameter changes
    this.routeSubscription = this.route.params.subscribe(params => {
      const worldStoryId = params['id'];
      this.loadStoryData(worldStoryId);
    });
    
    // Load character list
    this.loadSharedData();
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private loadSharedData() {
    this.worldCharacterService.getAllWorldCharacters().then((characters) => {
      this.characterList = characters;
    });
    
    this.worldLocationService.getAllWorldLocations().then((locations) => {
      this.locationList = locations;
    });

    this.worldEventService.getAllWorldEvents().then((events) => {
      this.eventList = events;
      this.updateFilteredEvents();
    });

    this.worldStoryService.getAllWorldStories().then((stories) => {
      this.storyList = stories;
    });
  }

  private loadStoryData(worldStoryId: string) {
    this.worldStoryService.getWorldStoryById(worldStoryId).then((worldStory) => {
      this.worldStory = worldStory;
      
      // Ensure arrays are initialized
      if (this.worldStory) {
        this.worldStory.characters = this.worldStory.characters || [];
        this.worldStory.locations = this.worldStory.locations || [];
        this.worldStory.tags = this.worldStory.tags || [];
        this.worldStory.substories = this.worldStory.substories || [];
      }
      
      this.applyForm.patchValue({
        storyTitle: worldStory?.title || '',
        storyDescription: worldStory?.description || '',
        storyCharacters: worldStory?.characters?.join(', ') || '',
        storyLocations: worldStory?.locations?.join(', ') || '',
        storyTags: worldStory?.tags?.join(', ') || ''
      });
      
      // Update filtered events after story data loads
      this.updateFilteredEvents();
    });

    console.log("Story data loaded for ID:", worldStoryId);
  }

  // isCharacterInStory(characterName: string): boolean {
  //   return this.worldStory?.characters?.includes(characterName) || false;
  // }

  // Updated: now expects characterId
  isCharacterInStory(characterId: string): boolean {
    return this.worldStory?.characters?.includes(characterId) || false;
  }

  isLocationInStory(locationName: string): boolean {
    return this.worldStory?.locations?.includes(locationName) || false;
  }

  getCharactersAssociationList(): AssociationItem[] {
    return this.characterList.map(character => ({
      id: character.id,
      name: `${character.firstName} ${character.lastName}`,
      isAssociated: this.isCharacterInStory(character.id)
    }));
  }

  getLocationsAssociationList(): AssociationItem[] {
    return this.locationList.map(location => ({
      id: location.id,
      name: location.name,
      isAssociated: this.worldStory?.locations?.includes(location.id) || false
    }));
  }



  getSubstoryListForComponent() {
    const currentId = this.worldStory?.id;
    return this.storyList
      .filter(story => story.id !== currentId)
      .map(story => ({
        id: story.id,
        name: story.title,
        isSubstory: (this.worldStory?.substories || []).includes(story.id)
      }));
  }

  onSubstoryListToggled(event: {id: string, isChecked: boolean}) {
    if (!this.worldStory) return;
    const subId = event.id;
    if (event.isChecked) {
      if (!this.worldStory.substories.includes(subId)) {
        this.worldStory.substories.push(subId);
      }
    } else {
      this.worldStory.substories = this.worldStory.substories.filter(id => id !== subId);
    }
  }

  onCharacterToggle(event: {id: string, isChecked: boolean}) {
    const character = this.characterList.find(c => c.id === event.id);
    if (character && this.worldStory) {
      if (event.isChecked) {
        if (!this.worldStory.characters.includes(character.id)) {
          this.worldStory.characters.push(character.id);
        }
      } else {
        this.worldStory.characters = this.worldStory.characters.filter(id => id !== character.id);
      }
      console.log(`Character ${character.firstName} ${character.lastName} (${character.id}) ${event.isChecked ? 'added to' : 'removed from'} story`);
    }
  }

  onLocationToggle(event: {id: string, isChecked: boolean}) {
    const location = this.locationList.find(l => l.id === event.id);
    if (location && this.worldStory) {
      if (event.isChecked) {
        if (!this.worldStory.locations.includes(location.id)) {
          this.worldStory.locations.push(location.id);
        }
      } else {
        this.worldStory.locations = this.worldStory.locations.filter(id => id !== location.id);
      }
      console.log(`Location ${location.name} (${location.id}) ${event.isChecked ? 'added to' : 'removed from'} story`);
    }
  }

  onSubstoryToggle(event: {id: string, isChecked: boolean}) {
    const substory = this.storyList.find(s => s.id === event.id);
    if (substory && this.worldStory) {
      if (event.isChecked) {
        if (!this.worldStory.substories.includes(substory.id)) {
          this.worldStory.substories.push(substory.id);
        }
      } else {
        this.worldStory.substories = this.worldStory.substories.filter(id => id !== substory.id);
      }
      console.log(`Substory ${substory.title} (${substory.id}) ${event.isChecked ? 'added to' : 'removed from'} story`);
    }
  }

  onCharacterChange(event: Event, character: WorldCharacterInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      const storyId = this.worldStory?.id || '';
      console.log(`Character ${character.firstName} ${character.lastName} ${isChecked ? 'added to' : 'removed from'} story`);
      // Update the character's stories list by ID
      this.worldCharacterService.getWorldCharacterById(character.id).then((fullCharacter) => {
        if (fullCharacter) {
          let updatedStories = fullCharacter.stories || [];
          if (isChecked) {
            if (!updatedStories.includes(storyId)) {
              updatedStories.push(storyId);
            }
          } else {
            updatedStories = updatedStories.filter(id => id !== storyId);
          }
          this.worldCharacterService.updateWorldCharacter(
            character.id,
            fullCharacter.firstName,
            fullCharacter.lastName,
            fullCharacter.altNames || [],
            fullCharacter.birthdate || '',
            fullCharacter.birthEventId || '',
            fullCharacter.deathdate || '',
            fullCharacter.deathEventId || '',
            fullCharacter.pronouns || '',
            fullCharacter.roles || [],
            fullCharacter.affiliations || [],
            fullCharacter.relationships || [],
            fullCharacter.physicalDescription || '',
            fullCharacter.nonPhysicalDescription || '',
            updatedStories,
            fullCharacter.tags || []
          );
        }
      });
    }
  }

  onLocationChange(event: Event, location: WorldLocationInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      const storyId = this.worldStory?.id || '';
      console.log(`Location ${location.name} ${isChecked ? 'added to' : 'removed from'} story`);
      // Update the location's stories list by ID
      this.worldLocationService.getWorldLocationById(location.id).then((fullLocation) => {
        if (fullLocation) {
          let updatedStories = fullLocation.stories || [];
          if (isChecked) {
            if (!updatedStories.includes(storyId)) {
              updatedStories.push(storyId);
            }
          } else {
            updatedStories = updatedStories.filter(id => id !== storyId);
          }
          this.worldLocationService.updateWorldLocation(
            location.id,
            fullLocation.name,
            fullLocation.description,
            fullLocation.characters || [],
            updatedStories,
            fullLocation.relatedLocations || [],
            fullLocation.tags || []
          );
        }
      });
    }
  }

  getFormCharacters(): string[] {
    const characters: string[] = [];
    for (let character of this.characterList) {
      const checkbox = document.getElementById(`character-checkbox-${character.id}`) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        characters.push(character.id);
      }
    }
    return characters;
  }

  getFormLocations(): string[] {
    const locations: string[] = [];
    for (let location of this.locationList) {
      const checkbox = document.getElementById(`location-checkbox-${location.id}`) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        locations.push(location.name);
      }
    }
    return locations;
  }

  async submitApplication() {
    if (this.worldStory?.id !== undefined) {
      try {
        // Use the story data directly instead of reading from DOM
        await this.worldStoryService.updateWorldStory(
          this.worldStory.id,
          this.applyForm.value.storyTitle ?? '',
          this.applyForm.value.storyDescription ?? '',
          this.worldStory.characters,
          this.worldStory.locations,
          this.applyForm.value.storyTags?.split(', ').filter(tag => tag.trim() !== '') ?? [],
          this.worldStory.substories ?? []
        );
        
        console.log('Story updated successfully');
        // Optionally refresh the data
        this.loadStoryData(this.worldStory.id);
      } catch (error) {
        console.error('Failed to update story:', error);
        // Optionally show an error message to the user
      }
    }
  }

  onSubstoryOrderChanged(newOrder: string[]) {
    if (this.worldStory) {
      this.worldStory.substories = [...newOrder];
    }
  }
  
  private updateFilteredEvents() {
    if (!this.worldStory || this.eventList.length === 0) {
      this.filteredEventList = [];
      return;
    }

    

    this.filteredEventList = this.eventList.filter(event => 
      event.stories.includes(this.worldStory?.title || '')
    );
  }

  onTimelineTagClicked(tag: string) {
    console.log('Timeline tag clicked:', tag);
    // You can implement tag filtering logic here if needed
  }
  
  async deleteStory() {
    if (this.worldStory?.id && confirm(`Are you sure you want to delete "${this.worldStory.title}"? This action cannot be undone.`)) {
      try {
        await this.worldStoryService.deleteWorldStory(this.worldStory.id);
        this.router.navigate(['/story']);
      } catch (error) {
        console.error('Failed to delete story:', error);
        // Optionally show an error message to the user
      }
    }
  }
}