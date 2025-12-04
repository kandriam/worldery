import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { WorldLocationService } from '../../services/world-location.service';
import { WorldLocationInfo } from '../../worldlocation';
import { WorldCharacterService } from '../../services/world-character.service';
import { WorldCharacterInfo } from '../../worldcharacter';
import { WorldStoryService } from '../../services/world-story.service';
import { WorldStoryInfo } from '../../worldstory';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: 'location-details.html',
  styleUrls: ["location-details.css", "../details.css", "../../../styles.css"],
})

export class WorldLocationDetails implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  worldLocationService = inject(WorldLocationService);
  worldCharacterService = inject(WorldCharacterService);
  worldStoryService = inject(WorldStoryService);
  worldLocation: WorldLocationInfo | undefined;
  characterList = Array<WorldCharacterInfo>();
  storyList = Array<WorldStoryInfo>();
  locationList = Array<WorldLocationInfo>();
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
      const worldLocationId = parseInt(params['id'], 10);
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
  }

  private loadLocationData(worldLocationId: number) {
    this.worldLocationService.getWorldLocationById(worldLocationId).then((worldLocation) => {
      this.worldLocation = worldLocation;
      this.applyForm.patchValue({
        locationTitle: worldLocation?.name || '',
        locationDescription: worldLocation?.description || '',
        locationCharacters: worldLocation?.characters?.join(', ') || '',
        locationStories: worldLocation?.stories?.join(', ') || '',
        locationTags: worldLocation?.tags?.join(', ') || '',
      });
    });

    console.log("Location data loaded for ID:", worldLocationId);
  }

  isCharacterInLocation(characterName: string): boolean {
    return this.worldLocation?.characters?.includes(characterName) || false;
  }

  isStoryInLocation(storyTitle: string): boolean {
    return this.worldLocation?.stories?.includes(storyTitle) || false;
  }

  isRelatedLocationInLocation(locationName: string): boolean {
    return this.worldLocation?.relatedLocations?.includes(locationName) || false;
  }

  onCharacterChange(event: Event, character: WorldCharacterInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Character ${character.firstName} ${character.lastName} ${isChecked ? 'added to' : 'removed from'} location`);
    }
  }

  onStoryChange(event: Event, story: WorldStoryInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Story ${story.title} ${isChecked ? 'added to' : 'removed from'} location`);
    }
  }

  onRelatedLocationChange(event: Event, location: WorldLocationInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Related location ${location.name} ${isChecked ? 'added to' : 'removed from'} location`);
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

  getFormRelatedLocations(): string[] {
    const relatedLocations: string[] = [];
    for (let location of this.locationList) {
      const checkbox = document.getElementById(`related-location-checkbox-${location.id}`) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        relatedLocations.push(location.name);
      }
    }
    return relatedLocations;
  }

  submitApplication() {
    const selectedCharacters = this.getFormCharacters();
    const selectedStories = this.getFormStories();
    const selectedRelatedLocations = this.getFormRelatedLocations();
    
    if (this.worldLocation?.id !== undefined) {
      this.worldLocationService.updateWorldLocation(
        this.worldLocation.id,
        this.applyForm.value.locationTitle ?? '',
        this.applyForm.value.locationDescription ?? '',
        selectedCharacters,
        selectedStories,
        selectedRelatedLocations,
        this.applyForm.value.locationTags?.split(', ') ?? [],
      );
    }
  }

  deleteLocation() {
    if (this.worldLocation?.id && confirm(`Are you sure you want to delete "${this.worldLocation.name}"? This action cannot be undone.`)) {
      this.worldLocationService.deleteWorldLocation(this.worldLocation.id);
      this.router.navigate(['/location']);
    }
  }
}
