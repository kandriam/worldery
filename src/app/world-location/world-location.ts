import { Component, input } from '@angular/core';
import { WorldLocationInfo } from '../worldlocation';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-location',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="world-container" [routerLink]="['/location-details', worldLocation().id]">
      <h4 class="world-heading">{{ worldLocation().name }}</h4>
      <p class="world-description">{{ worldLocation().description }}</p>
      <!-- <p class="world-location">{{ worldLocation().location.join(', ') }}</p>
      <p class="world-characters">{{ worldLocation().characters.join(', ') }}</p>
      <p class="world-stories">{{ worldLocation().stories.join(', ') }}</p> -->
      @for (tag of worldLocation().tags; track tag) {
        <span class="home-tags">{{ tag }}</span>
      }
    </div>
  `,
  styleUrls: ['./world-location.css', '../../styles.css']
})
export class WorldLocation {
    worldLocation = input.required<WorldLocationInfo>();

}
