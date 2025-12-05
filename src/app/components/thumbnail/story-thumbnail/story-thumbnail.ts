import {Component, inject, input, output} from '@angular/core';
import {WorldStoryInfo} from '../../../worldstory';
import {RouterLink } from '@angular/router';
import { WorldStoryService } from '../../../services/world-story.service';

@Component({
  selector: 'app-story-thumbnail',
  imports: [RouterLink],
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
