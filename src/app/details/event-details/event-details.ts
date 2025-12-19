import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
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
import { Timeline } from "src/app/components/timeline/timeline/timeline";
import { AssociationList, AssociationItem, EntityType } from '../../components/association-list/association-list';

@Component({
  selector: 'app-details',
  imports: [CommonModule, ReactiveFormsModule, Timeline, AssociationList],
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
  settingsService = inject(SettingsService);
    getFormattedEventDate(): string {
      if (!this.worldEvent?.date) return '';
      return this.settingsService.formatDate(this.worldEvent.date);
    }

    getFormattedEventEndDate(): string {
      if (!this.worldEvent?.endDate) return '';
      return this.settingsService.formatDate(this.worldEvent.endDate);
    }
  characterList = Array<WorldCharacterInfo>();
  storyList = Array<WorldStoryInfo>();
  locationList = Array<WorldLocationInfo>();
  filteredEventList = Array<WorldEventInfo>();
  private routeSubscription: Subscription | undefined;

  // Date dropdown options
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  applyForm = new FormGroup({
    eventTitle: new FormControl(''),
    eventYear: new FormControl(''),
    eventMonth: new FormControl(''),
    eventDay: new FormControl(''),
    eventEndYear: new FormControl(''),
    eventEndMonth: new FormControl(''),
    eventEndDay: new FormControl(''),
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
      const worldEventId = params['id'];
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
    
    // Load all events for timeline
    this.worldEventService.getAllWorldEvents().then((events) => {
      this.filteredEventList = events;
    });
  }

  private loadEventData(worldEventId: string) {
    this.worldEventService.getWorldEventById(worldEventId).then((worldEvent) => {
      this.worldEvent = worldEvent;
      
      // Parse date into separate components
      const eventDate = worldEvent?.date || '';
      let year = '', month = '', day = '';
      
      if (eventDate) {
        const dateParts = eventDate.split('-');
        if (dateParts.length === 3) {
          year = dateParts[0];
          month = this.getMonthName(parseInt(dateParts[1]));
          day = parseInt(dateParts[2]).toString();
        }
      }

      // Parse end date into separate components
      const eventEndDate = worldEvent?.endDate || '';
      let endYear = '', endMonth = '', endDay = '';
      
      if (eventEndDate) {
        const endDateParts = eventEndDate.split('-');
        if (endDateParts.length === 3) {
          endYear = endDateParts[0];
          endMonth = this.getMonthName(parseInt(endDateParts[1]));
          endDay = parseInt(endDateParts[2]).toString();
        }
      }
      
      this.applyForm.patchValue({
        eventTitle: worldEvent?.name || '',
        eventYear: year,
        eventMonth: month,
        eventDay: day,
        eventEndYear: endYear,
        eventEndMonth: endMonth,
        eventEndDay: endDay,
        eventDescription: worldEvent?.description || '',
        eventLocation: worldEvent?.location?.join(', ') || '',
        eventCharacters: worldEvent?.characters?.join(', ') || '',
        eventStories: worldEvent?.stories?.join(', ') || '',
        eventTags: worldEvent?.tags?.join(', ') || '',
      });
    });

    console.log("Event data loaded for ID:", worldEventId);
  }

  isCharacterInEvent(characterId: string): boolean {
    return this.worldEvent?.characters?.includes(characterId) || false;
  }

  isStoryInEvent(storyId: string): boolean {
    return this.worldEvent?.stories?.includes(storyId) || false;
  }

  isLocationInEvent(locationId: string): boolean {
    return this.worldEvent?.location?.includes(locationId) || false;
  }

  getCharactersAssociationList(): AssociationItem[] {
    return this.characterList.map(character => ({
      id: character.id,
      name: `${character.firstName} ${character.lastName}`,
      isAssociated: this.isCharacterInEvent(character.id)
    }));
  }

  getStoriesAssociationList(): AssociationItem[] {
    return this.storyList.map(story => ({
      id: story.id,
      name: story.title,
      isAssociated: this.isStoryInEvent(story.id)
    }));
  }

  getLocationsAssociationList(): AssociationItem[] {
    return this.locationList.map(location => ({
      id: location.id,
      name: location.name,
      isAssociated: this.isLocationInEvent(location.id)
    }));
  }

  onCharacterToggle(event: {id: string, isChecked: boolean}) {
    if (this.worldEvent) {
      if (event.isChecked) {
        if (!this.worldEvent.characters.includes(event.id)) {
          this.worldEvent.characters.push(event.id);
        }
        // Ensure no duplicates
        this.worldEvent.characters = Array.from(new Set(this.worldEvent.characters));
      } else {
        this.worldEvent.characters = this.worldEvent.characters.filter(id => id !== event.id);
      }
      const character = this.characterList.find(c => c.id === event.id);
      const characterName = character ? `${character.firstName} ${character.lastName}` : event.id;
      console.log(`Character ${characterName} ${event.isChecked ? 'added to' : 'removed from'} event`);
    }
  }

  onStoryToggle(event: {id: string, isChecked: boolean}) {
    if (this.worldEvent) {
      if (event.isChecked) {
        if (!this.worldEvent.stories.includes(event.id)) {
          this.worldEvent.stories.push(event.id);
        }
      } else {
        this.worldEvent.stories = this.worldEvent.stories.filter(id => id !== event.id);
      }
      const story = this.storyList.find(s => s.id === event.id);
      const storyTitle = story ? story.title : event.id;
      console.log(`Story ${storyTitle} ${event.isChecked ? 'added to' : 'removed from'} event`);
    }
  }

  onLocationToggle(event: {id: string, isChecked: boolean}) {
    if (this.worldEvent) {
      if (event.isChecked) {
        if (!this.worldEvent.location.includes(event.id)) {
          this.worldEvent.location.push(event.id);
        }
      } else {
        this.worldEvent.location = this.worldEvent.location.filter(id => id !== event.id);
      }
      const location = this.locationList.find(l => l.id === event.id);
      const locationName = location ? location.name : event.id;
      console.log(`Location ${locationName} ${event.isChecked ? 'added to' : 'removed from'} event`);
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

  getFormLocations(): string[] {
    const locations: string[] = [];
    for (let location of this.locationList) {
      const checkbox = document.getElementById(`location-checkbox-${location.id}`) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        locations.push(location.id);
      }
    }
    return locations;
  }

  submitApplication() {
    const selectedCharacters = this.getFormCharacters();
    const selectedStories = this.getFormStories();
    const selectedLocations = this.getFormLocations();
    if (this.worldEvent?.id !== undefined) {
      const formattedDate = this.formatEventDate(
        this.applyForm.value.eventYear || '',
        this.applyForm.value.eventMonth || '',
        this.applyForm.value.eventDay || ''
      );
      const formattedEndDate = this.formatEventDate(
        this.applyForm.value.eventEndYear || '',
        this.applyForm.value.eventEndMonth || '',
        this.applyForm.value.eventEndDay || ''
      );
      this.worldEventService.updateWorldEvent(
        this.worldEvent.id,
        this.applyForm.value.eventTitle ?? '',
        formattedDate,
        formattedEndDate,
        this.applyForm.value.eventDescription ?? '',
        selectedLocations,
        selectedCharacters,
        selectedStories,
        this.applyForm.value.eventTags?.split(', ').filter(tag => tag.trim() !== '') ?? [],
      );

      // Check all characters for birthEventId or deathEventId matching this event, and clear if not associated anymore
      this.worldCharacterService.getAllWorldCharacters().then(async (characters) => {
        for (const character of characters) {
          let changed = false;
          let newBirthEventId: string = character.birthEventId || '';
          let newBirthdate: string = character.birthdate || '';
          let newDeathEventId: string = character.deathEventId || '';
          let newDeathdate: string = character.deathdate || '';

          // Remove birth/death event and date if character is no longer associated
          if (character.birthEventId === this.worldEvent!.id && !selectedCharacters.includes(character.id)) {
            newBirthEventId = '';
            newBirthdate = '';
            changed = true;
          }
          if (character.deathEventId === this.worldEvent!.id && !selectedCharacters.includes(character.id)) {
            newDeathEventId = '';
            newDeathdate = '';
            changed = true;
          }

          // If character is newly associated and this event is their birth event, set birthdate only if not already set
          if (selectedCharacters.includes(character.id) && this.worldEvent!.id === character.birthEventId && !character.birthdate) {
            newBirthdate = formattedDate;
            changed = true;
          }
          // If character is newly associated and this event is their death event, set deathdate only if not already set
          if (selectedCharacters.includes(character.id) && this.worldEvent!.id === character.deathEventId && !character.deathdate) {
            newDeathdate = formattedDate;
            changed = true;
          }

          if (changed) {
            await this.worldCharacterService.updateWorldCharacter(
              character.id,
              character.firstName,
              character.lastName,
              character.altNames,
              newBirthdate,
              newBirthEventId,
              newDeathdate,
              newDeathEventId,
              character.pronouns,
              character.roles,
              character.affiliations,
              character.relationships,
              character.physicalDescription,
              character.nonPhysicalDescription,
              character.stories,
              character.tags
            );
          }
        }
      });
    }
  }

  deleteEvent() {
    if (this.worldEvent?.id && confirm(`Are you sure you want to delete "${this.worldEvent.name}"? This action cannot be undone.`)) {
      // Check all characters for birthEventId or deathEventId matching this event
      this.worldCharacterService.getAllWorldCharacters().then(async (characters) => {
        for (const character of characters) {
          let changed = false;
          let newBirthEventId = character.birthEventId;
          let newBirthdate = character.birthdate;
          let newDeathEventId = character.deathEventId;
          let newDeathdate = character.deathdate;
          if (character.birthEventId === this.worldEvent!.id) {
            newBirthEventId = '';
            newBirthdate = '';
            changed = true;
          }
          if (character.deathEventId === this.worldEvent!.id) {
            newDeathEventId = '';
            newDeathdate = '';
            changed = true;
          }
          if (changed) {
            await this.worldCharacterService.updateWorldCharacter(
              character.id,
              character.firstName,
              character.lastName,
              character.altNames,
              newBirthdate || '',
              newBirthEventId || '',
              newDeathdate || '',
              newDeathEventId || '',
              character.pronouns,
              character.roles,
              character.affiliations,
              character.relationships,
              character.physicalDescription,
              character.nonPhysicalDescription,
              character.stories,
              character.tags
            );
          }
        }
        // Now delete the event
        this.worldEventService.deleteWorldEvent(this.worldEvent!.id);
        this.router.navigate(['/event']);
      });
    }
  }

  // Helper methods for date handling
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

  formatEventDate(year: string, monthName: string, day: string): string {
    if (!year || !monthName || !day) {
      return '';
    }
    
    const monthNumber = this.getMonthNumber(monthName);
    if (monthNumber === 0) {
      return '';
    }
    
    const paddedMonth = monthNumber.toString().padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    
    return `${year}-${paddedMonth}-${paddedDay}`;
  }

  // Timeline methods
  addWorldEvent() {
    this.router.navigate(['/event/new']);
  }

  onTagClicked(tag: string) {
    // Handle tag click - could navigate to filtered view or show related events
    console.log('Tag clicked:', tag);
  }
}
