import {Component, inject, input} from '@angular/core';
import {WorldStoryInfo} from '../../worldstory';
import {RouterLink, RouterOutlet } from '@angular/router';
import { WorldStoryService } from '../../services/world-story.service';

@Component({
  selector: 'app-story-thumbnail',
  imports: [RouterLink, RouterOutlet],
  templateUrl: 'story-thumbnail.html',
  styleUrls: ['story-thumbnail.css', '../thumbnail.css', '../../../styles.css'],
})

export class StoryThumbnail {
  storyService = inject(WorldStoryService);
  worldStory = input.required<WorldStoryInfo>();

  deleteStory(id: number, event: Event) {
    event.stopPropagation();
    console.log(`Delete story with ID: ${id}`);
    this.storyService.deleteWorldStory(id);
  }
}
