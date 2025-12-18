import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorldLocationService } from '../../services/world-location.service';
import { WorldEventService } from '../../services/world-event.service';
import { WorldLocationInfo } from '../../worldlocation';
import { WorldCharacterService } from '../../services/world-character.service';
import { WorldCharacterInfo } from '../../worldcharacter';
import { WorldStoryService } from '../../services/world-story.service';
import { WorldStoryInfo } from '../../worldstory';
import { WorldEventInfo } from '../../worldevent';
import { Timeline } from '../../components/timeline/timeline/timeline';
import { AssociationList, AssociationItem, EntityType } from '../../components/association-list/association-list';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule, Timeline, AssociationList],
  templateUrl: 'location-details.html',
  styleUrls: ["location-details.css", "../details.css", "../../../styles.css"],
})

export class WorldLocationDetails implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  worldLocationService = inject(WorldLocationService);
  worldEventService = inject(WorldEventService);
  worldCharacterService = inject(WorldCharacterService);
  worldStoryService = inject(WorldStoryService);
  worldLocation: WorldLocationInfo | undefined;
  characterList = Array<WorldCharacterInfo>();
  storyList = Array<WorldStoryInfo>();
  locationList = Array<WorldLocationInfo>();
  eventList = Array<WorldEventInfo>();
  filteredEventList = Array<WorldEventInfo>();
  private routeSubscription: Subscription | undefined;

  applyForm = new FormGroup({
    locationTitle: new FormControl(''),
    locationDate: new FormControl(''),
    locationDescription: new FormControl(''),
    locationLocation: new FormControl(''),
    locationCharacters: new FormControl(''),
    locationStories: new FormControl(''),
    locationTags: new FormControl(''),
  });

  constructor() {
    // Moved initialization logic to ngOnInit
  }

  ngOnInit() {
    // Subscribe to route parameter changes
    this.routeSubscription = this.route.params.subscribe(params => {
      const worldLocationId = params['id'];
      this.loadLocationData(worldLocationId);
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

  private loadLocationData(worldLocationId: string) {
    this.worldLocationService.getWorldLocationById(worldLocationId).then((worldLocation) => {
      this.worldLocation = worldLocation;
      
      // Ensure arrays are initialized
      if (this.worldLocation) {
        this.worldLocation.characters = this.worldLocation.characters || [];
        this.worldLocation.stories = this.worldLocation.stories || [];
        this.worldLocation.relatedLocations = this.worldLocation.relatedLocations || [];
        this.worldLocation.tags = this.worldLocation.tags || [];
      }
      
      this.applyForm.patchValue({
        locationTitle: worldLocation?.name || '',
        locationDescription: worldLocation?.description || '',
        locationCharacters: worldLocation?.characters?.join(', ') || '',
        locationStories: worldLocation?.stories?.join(', ') || '',
        locationTags: worldLocation?.tags?.join(', ') || '',
      });
      
      // Update filtered events after location data loads
      this.updateFilteredEvents();
    });

    console.log("Location data loaded for ID:", worldLocationId);
  }

  isCharacterInLocation(characterId: string): boolean {
    return this.worldLocation?.characters?.includes(characterId) || false;
  }

  isStoryInLocation(storyId: string): boolean {
    return this.worldLocation?.stories?.includes(storyId) || false;
  }

  isRelatedLocationInLocation(locationId: string): boolean {
    return this.worldLocation?.relatedLocations?.includes(locationId) || false;
  }

  getCharactersAssociationList(): AssociationItem[] {
    return this.characterList.map(character => ({
      id: character.id,
      name: `${character.firstName} ${character.lastName}`,
      isAssociated: this.isCharacterInLocation(character.id)
    }));
  }

  getStoriesAssociationList(): AssociationItem[] {
    return this.storyList.map(story => ({
      id: story.id,
      name: story.title,
      isAssociated: this.isStoryInLocation(story.id)
    }));
  }

  getRelatedLocationsAssociationList(): AssociationItem[] {
    return this.locationList
      .filter(location => this.worldLocation?.id !== location.id)
      .map(location => ({
        id: location.id,
        name: location.name,
        isAssociated: this.isRelatedLocationInLocation(location.id)
      }));
  }

  onCharacterToggle(event: {id: string, isChecked: boolean}) {
    if (this.worldLocation) {
      if (event.isChecked) {
        if (!this.worldLocation.characters.includes(event.id)) {
          this.worldLocation.characters.push(event.id);
        }
      } else {
        this.worldLocation.characters = this.worldLocation.characters.filter(id => id !== event.id);
      }
      const character = this.characterList.find(c => c.id === event.id);
      const characterName = character ? `${character.firstName} ${character.lastName}` : event.id;
      console.log(`Character ${characterName} ${event.isChecked ? 'added to' : 'removed from'} location`);
    }
  }

  onStoryToggle(event: {id: string, isChecked: boolean}) {
    if (this.worldLocation) {
      if (event.isChecked) {
        if (!this.worldLocation.stories.includes(event.id)) {
          this.worldLocation.stories.push(event.id);
        }
      } else {
        this.worldLocation.stories = this.worldLocation.stories.filter(id => id !== event.id);
      }
      const story = this.storyList.find(s => s.id === event.id);
      const storyTitle = story ? story.title : event.id;
      console.log(`Story ${storyTitle} ${event.isChecked ? 'added to' : 'removed from'} location`);
    }
  }

  onRelatedLocationToggle(event: {id: string, isChecked: boolean}) {
    if (this.worldLocation) {
      if (event.isChecked) {
        if (!this.worldLocation.relatedLocations.includes(event.id)) {
          this.worldLocation.relatedLocations.push(event.id);
        }
      } else {
        this.worldLocation.relatedLocations = this.worldLocation.relatedLocations.filter(id => id !== event.id);
      }
      const location = this.locationList.find(l => l.id === event.id);
      const locationName = location ? location.name : event.id;
      console.log(`Related location ${locationName} ${event.isChecked ? 'added to' : 'removed from'} location`);
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

  getFormRelatedLocations(): string[] {
    const relatedLocations: string[] = [];
    for (let location of this.locationList) {
      const checkbox = document.getElementById(`related-location-checkbox-${location.id}`) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        relatedLocations.push(location.id);
      }
    }
    return relatedLocations;
  }

  async submitApplication() {
    if (this.worldLocation?.id !== undefined) {
      try {
        // Use the form's checked associations (by ID) for update
        const updatedCharacters = this.getFormCharacters();
        const updatedStories = this.getFormStories();
        const updatedRelatedLocations = this.getFormRelatedLocations();
        await this.worldLocationService.updateWorldLocation(
          this.worldLocation.id,
          this.applyForm.value.locationTitle ?? '',
          this.applyForm.value.locationDescription ?? '',
          updatedCharacters,
          updatedStories,
          updatedRelatedLocations,
          this.applyForm.value.locationTags?.split(', ').filter(tag => tag.trim() !== '') ?? [],
        );
        console.log('Location updated successfully');
        // Optionally refresh the data or show a success message
        this.loadLocationData(this.worldLocation.id);
      } catch (error) {
        console.error('Failed to update location:', error);
        // Optionally show an error message to the user
      }
    }
  }

  async deleteLocation() {
    if (this.worldLocation?.id && confirm(`Are you sure you want to delete "${this.worldLocation.name}"? This action cannot be undone.`)) {
      try {
        await this.worldLocationService.deleteWorldLocation(this.worldLocation.id);
        this.router.navigate(['/location']);
      } catch (error) {
        console.error('Failed to delete location:', error);
        // Optionally show an error message to the user
      }
    }
  }
  
  private updateFilteredEvents() {
    if (!this.worldLocation || this.eventList.length === 0) {
      this.filteredEventList = [];
      return;
    }
    // Filter events by location ID
    this.filteredEventList = this.eventList.filter(event => 
      event.location && (Array.isArray(event.location)
        ? event.location.includes(this.worldLocation?.id || '')
        : event.location === this.worldLocation?.id)
    );
  }

  onTimelineTagClicked(tag: string) {
    console.log('Timeline tag clicked:', tag);
    // You can implement tag filtering logic here if needed
  }
}
