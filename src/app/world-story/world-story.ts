import {Component, input} from '@angular/core';
import {WorldStoryInfo} from '../worldstory';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-story',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="story-container" [routerLink]="['/story-details', worldStory().id]">
      <h4 class="story-heading">{{ worldStory().title }}</h4>
      <p class="story-description">{{ worldStory().description }}</p>
      @for (tag of worldStory().tags; track tag) {
        <span class="home-tags">{{ tag }}</span>
      }
    </div>
  `,
  styleUrls: ['./world-story.css', '../../styles.css'],
})

export class WorldStory {
  worldStory = input.required<WorldStoryInfo>();
}
