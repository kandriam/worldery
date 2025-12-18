import { Component, input, inject, output } from '@angular/core';
import { WorldLocationInfo } from '../../../worldlocation';
import {RouterLink } from '@angular/router';
import { WorldLocationService } from '../../../services/world-location.service';
@Component({
  selector: 'app-location-thumbnail',
  imports: [RouterLink],
  templateUrl: 'location-thumbnail.html',
  styleUrls: ['location-thumbnail.css', '../thumbnail.css']
})
export class LocationThumbnail {
  locationService = inject(WorldLocationService);
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
    // Resolve character IDs to names
    const allCharacters = await import('../../../services/world-character.service').then(m => m.WorldCharacterService.prototype.getAllWorldCharacters.call({url: '/worldcharacters'}));
    this.characterNames = this.worldLocation().characters
      .map(id => {
        const c = allCharacters.find((ch: any) => ch.id === id);
        return c ? `${c.firstName} ${c.lastName}` : id;
      });
    // Resolve story IDs to titles
    const allStories = await import('../../../services/world-story.service').then(m => m.WorldStoryService.prototype.getAllWorldStories.call({url: '/worldstories'}));
    this.storyTitles = this.worldLocation().stories
      .map(id => {
        const s = allStories.find((story: any) => story.id === id);
        return s ? s.title : id;
      });
    // Resolve related location IDs to names
    const allLocations = await import('../../../services/world-location.service').then(m => m.WorldLocationService.prototype.getAllWorldLocations.call({url: '/worldlocations'}));
    this.relatedLocationNames = this.worldLocation().relatedLocations
      .map(id => {
        const l = allLocations.find((loc: any) => loc.id === id);
        return l ? l.name : id;
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
