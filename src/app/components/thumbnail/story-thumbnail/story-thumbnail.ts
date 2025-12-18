import {Component, inject, input, output} from '@angular/core';
import { NgClass } from '@angular/common';
import {WorldStoryInfo} from '../../../worldstory';
import { WorldLocationService } from '../../../services/world-location.service';  
import { WorldCharacterService } from '../../../services/world-character.service';
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
  locationService = inject(WorldLocationService);
  characterService = inject(WorldCharacterService);
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
    // Resolve related location IDs to names
    const allLocations = await this.locationService.getAllWorldLocations();
    this.locationNames = (this.worldStory().locations || []).map(id => {
      const loc = allLocations.find((location: any) => location.id === id);
      return loc ? loc.name : id;
    });

    // Resolve character IDs to names
    const allCharacters = await this.characterService.getAllWorldCharacters();
    this.characterNames = (this.worldStory().characters || []).map(id => {
      const c = allCharacters.find((char: any) => char.id === id);
      return c ? `${c.firstName} ${c.lastName}` : id;
    });

    // Populate substories with WorldStoryInfo objects
    if (this.worldStory().substories && this.worldStory().substories.length > 0) {
      const allStories = await this.storyService.getAllWorldStories();
      this.substories = this.worldStory().substories
        .map(id => allStories.find(story => story.id === id))
        .filter((story): story is WorldStoryInfo => !!story);
    }
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
