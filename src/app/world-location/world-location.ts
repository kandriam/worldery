import { Component, input } from '@angular/core';
import { WorldLocationInfo } from '../worldlocation';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-location',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="location-thumbnail world-thumbnail" [routerLink]="['/location-details', worldLocation().id]">
      <h4 class="thumbnail-title">{{ worldLocation().name }}</h4>
      <div class="world-description">{{ worldLocation().description }}</div>
      <!-- <p class="world-location">{{ worldLocation().location.join(', ') }}</p>
      <p class="world-characters">{{ worldLocation().characters.join(', ') }}</p>
      <p class="world-stories">{{ worldLocation().stories.join(', ') }}</p> -->
      <div class="thumbnail-tag-container">
        @for (tag of worldLocation().tags; track tag) {
          <div class="world-tags">{{ tag }}</div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./world-location.css', '../../styles.css']
})
export class WorldLocation {
    worldLocation = input.required<WorldLocationInfo>();

}
