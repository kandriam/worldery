import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { WorldStoryService } from '../../services/world-story.service';
import { WorldEventService } from '../../services/world-event.service';
import { WorldStoryInfo } from '../../worldstory';
import { WorldCharacterService } from '../../services/world-character.service';
import { WorldCharacterInfo } from '../../worldcharacter';
import { WorldLocationService } from '../../services/world-location.service';
import { WorldLocationInfo } from '../../worldlocation';
import { WorldEventInfo } from '../../worldevent';
import { Timeline } from '../../components/timeline/timeline/timeline';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule, RouterLink, Timeline],
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
      const worldStoryId = parseInt(params['id'], 10);
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
  }

  private loadStoryData(worldStoryId: number) {
    this.worldStoryService.getWorldStoryById(worldStoryId).then((worldStory) => {
      this.worldStory = worldStory;
      this.applyForm.patchValue({
        storyTitle: worldStory?.title || '',
        storyDescription: worldStory?.description || '',
        storyCharacters: worldStory?.characters?.join(', ') || '',
        storyLocations: worldStory?.locations?.join(', ') || '',
        storyTags: worldStory?.tags?.join(', ') || '',
      });
      
      // Update filtered events after story data loads
      this.updateFilteredEvents();
    });

    console.log("Story data loaded for ID:", worldStoryId);
  }

  isCharacterInStory(characterName: string): boolean {
    return this.worldStory?.characters?.includes(characterName) || false;
  }

  isLocationInStory(locationName: string): boolean {
    return this.worldStory?.locations?.includes(locationName) || false;
  }

  onCharacterChange(event: Event, character: WorldCharacterInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      const storyTitle = this.worldStory?.title || '';
      console.log(`Character ${character.firstName} ${character.lastName} ${isChecked ? 'added to' : 'removed from'} story`);
      
      // Update the character's stories list
      this.worldCharacterService.getWorldCharacterById(character.id).then((fullCharacter) => {
        if (fullCharacter) {
          let updatedStories = fullCharacter.stories || [];
          
          if (isChecked) {
            // Add story if not already present
            if (!updatedStories.includes(storyTitle)) {
              updatedStories.push(storyTitle);
            }
          } else {
            // Remove story if present
            updatedStories = updatedStories.filter(story => story !== storyTitle);
          }
          
          // Update the character with the new stories list
          this.worldCharacterService.updateWorldCharacter(
            character.id,
            fullCharacter.firstName,
            fullCharacter.lastName,
            fullCharacter.altNames || [],
            fullCharacter.birthdate || '',
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
      const storyTitle = this.worldStory?.title || '';
      console.log(`Location ${location.name} ${isChecked ? 'added to' : 'removed from'} story`);
      
      // Update the location's stories list
      this.worldLocationService.getWorldLocationById(location.id).then((fullLocation) => {
        if (fullLocation) {
          let updatedStories = fullLocation.stories || [];
          
          if (isChecked) {
            // Add story if not already present
            if (!updatedStories.includes(storyTitle)) {
              updatedStories.push(storyTitle);
            }
          } else {
            // Remove story if present
            updatedStories = updatedStories.filter(story => story !== storyTitle);
          }
          
          // Update the location with the new stories list
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
        characters.push(`${character.firstName} ${character.lastName}`);
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
    const selectedCharacters = this.getFormCharacters();
    const selectedLocations = this.getFormLocations();
    
    if (this.worldStory?.id !== undefined) {
      try {
        // The service now handles bidirectional relationships automatically
        await this.worldStoryService.updateWorldStory(
          this.worldStory.id,
          this.applyForm.value.storyTitle ?? '',
          this.applyForm.value.storyDescription ?? '',
          selectedCharacters,
          selectedLocations,
          this.applyForm.value.storyTags?.split(', ').filter(tag => tag.trim() !== '') ?? [],
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