import { WorldCharacterService } from '../../../services/world-character.service';
import { WorldStoryService } from '../../../services/world-story.service';

import {Component, inject, input, output} from '@angular/core';
import {WorldEventInfo} from '../../../worldevent';
import {RouterLink } from '@angular/router';
import { WorldEventService } from '../../../services/world-event.service';
import { WorldLocationService } from 'src/app/services/world-location.service';
@Component({
  selector: 'app-event-thumbnail',
  imports: [RouterLink],
  templateUrl: 'event-thumbnail.html',
  styleUrls: ['event-thumbnail.css', '../thumbnail.css'],
})

export class EventThumbnail {
  worldEvent = input.required<WorldEventInfo>();
  showDate = input<boolean>(true);
  showLocation = input<boolean>(true);
  showCharacters = input<boolean>(true);
  showStories = input<boolean>(true);
  worldEventService = inject(WorldEventService);
  worldLocationService = inject(WorldLocationService);
  
  tagClicked = output<string>();
  characterService = inject(WorldCharacterService);
  storyService = inject(WorldStoryService);

  characterNames: string[] = [];
  storyTitles: string[] = [];
  locationNames: string[] = [];

  async ngOnInit() {
    // Resolve character IDs to names
    const allCharacters = await this.characterService.getAllWorldCharacters();
    this.characterNames = (this.worldEvent().characters || []).map(id => {
      const c = allCharacters.find((char: any) => char.id === id);
      return c ? `${c.firstName} ${c.lastName}` : id;
    });
    // Resolve story IDs to titles
    const allStories = await this.storyService.getAllWorldStories();
    this.storyTitles = (this.worldEvent().stories || []).map(id => {
      const s = allStories.find((story: any) => story.id === id);
      return s ? s.title : id;
    });
    // Resolve location IDs to names (location: string[])
    const allLocations = await this.worldLocationService.getAllWorldLocations();
    this.locationNames = (this.worldEvent().location || []).map(id => {
      const l = allLocations.find((loc: any) => loc.id === id);
      return l ? l.name : id;
    });
  }

  deleteEvent(id: string, event: Event) {
    event.stopPropagation();
    console.log(`Delete event with ID: ${id}`);
    this.worldEventService.deleteWorldEvent(id);
  }
  
  onTagClick(tag: string, event: Event) {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
}
