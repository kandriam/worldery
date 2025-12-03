import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { WorldEventService } from '../../services/world-event.service';
import { WorldEventInfo } from '../../worldevent';
import { WorldCharacterService } from '../../services/world-character.service';
import { WorldCharacterInfo } from '../../worldcharacter';
import { WorldStoryService } from '../../services/world-story.service';
import { WorldStoryInfo } from '../../worldstory';
import { WorldLocationService } from '../../services/world-location.service';
import { WorldLocationInfo } from '../../worldlocation';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: 'event-details.html',
  styleUrls: ["event-details.css", "../details.css", "../../../styles.css"],
})

export class WorldEventDetails implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  worldEventService = inject(WorldEventService);
  worldCharacterService = inject(WorldCharacterService);
  worldStoryService = inject(WorldStoryService);
  worldLocationService = inject(WorldLocationService);
  worldEvent: WorldEventInfo | undefined;
  characterList = Array<WorldCharacterInfo>();
  storyList = Array<WorldStoryInfo>();
  locationList = Array<WorldLocationInfo>();
  private routeSubscription: Subscription | undefined;

  applyForm = new FormGroup({
    eventTitle: new FormControl(''),
    eventDate: new FormControl(''),
    eventDescription: new FormControl(''),
    eventLocation: new FormControl(''),
    eventCharacters: new FormControl(''),
    eventStories: new FormControl(''),
    eventTags: new FormControl(''),
  });

  constructor() {
    // Moved initialization logic to ngOnInit
  }

  ngOnInit() {
    // Subscribe to route parameter changes
    this.routeSubscription = this.route.params.subscribe(params => {
      const worldEventId = parseInt(params['id'], 10);
      this.loadEventData(worldEventId);
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

  private loadEventData(worldEventId: number) {
    this.worldEventService.getWorldEventById(worldEventId).then((worldEvent) => {
      this.worldEvent = worldEvent;
      this.applyForm.patchValue({
        eventTitle: worldEvent?.name || '',
        eventDate: worldEvent?.date || '',
        eventDescription: worldEvent?.description || '',
        eventLocation: worldEvent?.location?.join(', ') || '',
        eventCharacters: worldEvent?.characters?.join(', ') || '',
        eventStories: worldEvent?.stories?.join(', ') || '',
        eventTags: worldEvent?.tags?.join(', ') || '',
      });
    });

    console.log("Event data loaded for ID:", worldEventId);
  }

  isCharacterInEvent(characterName: string): boolean {
    return this.worldEvent?.characters?.includes(characterName) || false;
  }

  isStoryInEvent(storyTitle: string): boolean {
    return this.worldEvent?.stories?.includes(storyTitle) || false;
  }

  isLocationInEvent(locationName: string): boolean {
    return this.worldEvent?.location?.includes(locationName) || false;
  }

  onCharacterChange(event: Event, character: WorldCharacterInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Character ${character.firstName} ${character.lastName} ${isChecked ? 'added to' : 'removed from'} event`);
    }
  }

  onStoryChange(event: Event, story: WorldStoryInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Story ${story.title} ${isChecked ? 'added to' : 'removed from'} event`);
    }
  }

  onLocationChange(event: Event, location: WorldLocationInfo) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Location ${location.name} ${isChecked ? 'added to' : 'removed from'} event`);
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

  submitApplication() {
    const selectedCharacters = this.getFormCharacters();
    const selectedStories = this.getFormStories();
    const selectedLocations = this.getFormLocations();
    
    if (this.worldEvent?.id !== undefined) {
      this.worldEventService.updateWorldEvent(
        this.worldEvent.id,
        this.applyForm.value.eventTitle ?? '',
        this.applyForm.value.eventDate ?? '',
        this.applyForm.value.eventDescription ?? '',
        selectedLocations.join(', '),
        selectedCharacters.join(', '),
        selectedStories.join(', '),
        this.applyForm.value.eventTags?.split(', ') ?? [],
      );
    }
  }

  deleteEvent() {
    if (this.worldEvent?.id && confirm(`Are you sure you want to delete "${this.worldEvent.name}"? This action cannot be undone.`)) {
      this.worldEventService.deleteWorldEvent(this.worldEvent.id);
      this.router.navigate(['/event']);
    }
  }
}
