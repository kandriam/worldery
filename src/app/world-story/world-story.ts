import {Component, input} from '@angular/core';
import {WorldStoryInfo} from '../worldstory';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-story',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="story-thumbnail world-thumbnail" [routerLink]="['/story-details', worldStory().id]">
      <h4 class="thumbnail-title">{{ worldStory().title }}</h4>
      <div class="world-description">{{ worldStory().description }}</div>
      <div class="thumbnail-tag-container">
        @for (tag of worldStory().tags; track tag) {
          <div class="world-tags">{{ tag }}</div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./world-story.css', '../../styles.css'],
})

export class WorldStory {
  worldStory = input.required<WorldStoryInfo>();
}
