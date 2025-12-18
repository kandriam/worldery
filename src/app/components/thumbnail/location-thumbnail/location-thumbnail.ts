import { Component, input, inject, output } from '@angular/core';
import { WorldLocationInfo } from '../../../worldlocation';
import {RouterLink } from '@angular/router';
import { WorldLocationService } from '../../../services/world-location.service';
import { WorldCharacterService } from '../../../services/world-character.service';
import { WorldStoryService } from '../../../services/world-story.service';
@Component({
  selector: 'app-location-thumbnail',
  imports: [RouterLink],
  templateUrl: 'location-thumbnail.html',
  styleUrls: ['location-thumbnail.css', '../thumbnail.css']
})
export class LocationThumbnail {
  locationService = inject(WorldLocationService);
  characterService = inject(WorldCharacterService);
  storyService = inject(WorldStoryService);
  worldLocation = input.required<WorldLocationInfo>();
  showDate = input<boolean>(true);
  showLocation = input<boolean>(true);
  showCharacters = input<boolean>(true);
  showStories = input<boolean>(true);
  
  tagClicked = output<string>();

  characterNames: string[] = [];
  storyTitles: string[] = [];
  relatedLocationNames: string[] = [];

  async ngOnInit() {
    // Resolve related location IDs to names
    const allLocations = await this.locationService.getAllWorldLocations();
    this.relatedLocationNames = (this.worldLocation().relatedLocations || []).map(id => {
      const loc = allLocations.find((location: any) => location.id === id);
      return loc ? loc.name : id;
    });

    // Resolve character IDs to names
    const allCharacters = await this.characterService.getAllWorldCharacters();
    this.characterNames = (this.worldLocation().characters || []).map(id => {
      const c = allCharacters.find((char: any) => char.id === id);
      return c ? `${c.firstName} ${c.lastName}` : id;
    });

    // Resolve story IDs to titles
    const allStories = await this.storyService.getAllWorldStories();
    this.storyTitles = (this.worldLocation().stories || []).map(id => {
      const s = allStories.find((story: any) => story.id === id);
      return s ? s.title : id;
    });
  }

  deleteLocation(id: string, event: Event) {
    event.stopPropagation();
    console.log(`Delete location with ID: ${id}`);
    this.locationService.deleteWorldLocation(id);
  }
  
  onTagClick(tag: string, event: Event) {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
}
