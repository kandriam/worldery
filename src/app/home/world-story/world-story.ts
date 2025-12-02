import {Component, inject, input} from '@angular/core';
import {WorldStoryInfo} from '../../worldstory';
import {RouterLink, RouterOutlet } from '@angular/router';
import { WorldStoryService } from '../../services/world-story.service';

@Component({
  selector: 'app-world-story',
  imports: [RouterLink, RouterOutlet],
  templateUrl: 'world-story.html',
  styleUrls: ['world-story.css', '../home.css', '../../../styles.css'],
})

export class WorldStory {
  storyService = inject(WorldStoryService);
  worldStory = input.required<WorldStoryInfo>();

  deleteStory(id: number, event: Event) {
    event.stopPropagation();
    console.log(`Delete story with ID: ${id}`);
    this.storyService.deleteWorldStory(id);
  }
}
