import {Component, inject, input, output} from '@angular/core';
import { NgClass } from '@angular/common';
import {WorldStoryInfo} from '../../../worldstory';
import {RouterLink } from '@angular/router';
import { WorldStoryService } from '../../../services/world-story.service';
import { SubstoryThumbnailComponent } from './substory-thumbnail/substory-thumbnail.component';
@Component({
  selector: 'app-story-thumbnail',
  imports: [RouterLink, SubstoryThumbnailComponent, NgClass],
  templateUrl: 'story-thumbnail.html',
  styleUrls: ['story-thumbnail.css', '../thumbnail.css'],
})

export class StoryThumbnail {
  storyService = inject(WorldStoryService);
  worldStory = input.required<WorldStoryInfo>();
  showDate = input<boolean>(true);
  showLocation = input<boolean>(true);
  showCharacters = input<boolean>(true);
  showStories = input<boolean>(true);

  tagClicked = output<string>();

  substories: WorldStoryInfo[] = [];
  characterNames: string[] = [];
  locationNames: string[] = [];

  async ngOnInit() {
    if (this.worldStory().substories && this.worldStory().substories.length > 0) {
      const allStories = await this.storyService.getAllWorldStories();
      // Map substories to their WorldStoryInfo in the correct order
      this.substories = this.worldStory().substories
        .map(id => allStories.find(story => story.id === id))
        .filter((story): story is WorldStoryInfo => !!story);
    }
    // Resolve character IDs to names
    const allCharacters = await import('../../../services/world-character.service').then(m => m.WorldCharacterService.prototype.getAllWorldCharacters.call({url: '/worldcharacters'}));
    this.characterNames = this.worldStory().characters
      .map(id => {
        const c = allCharacters.find((ch: any) => ch.id === id);
        return c ? `${c.firstName} ${c.lastName}` : id;
      });
    // Resolve location IDs to names
    const allLocations = await import('../../../services/world-location.service').then(m => m.WorldLocationService.prototype.getAllWorldLocations.call({url: '/worldlocations'}));
    this.locationNames = this.worldStory().locations
      .map(id => {
        const l = allLocations.find((loc: any) => loc.id === id);
        return l ? l.name : id;
      });
  }

  deleteStory(id: string, event: Event) {
    event.stopPropagation();
    console.log(`Delete story with ID: ${id}`);
    this.storyService.deleteWorldStory(id);
  }

  onTagClick(tag: string, event: Event) {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
}
