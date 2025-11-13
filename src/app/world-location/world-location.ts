import { Component, input } from '@angular/core';
import { WorldLocationInfo } from '../worldlocation';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-location',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="world-container">
      <h4 class="world-heading">{{ worldLocation().name }}</h4>
      <p class="world-description">{{ worldLocation().description }}</p>
      <!-- <p class="world-location">{{ worldLocation().location.join(', ') }}</p>
      <p class="world-characters">{{ worldLocation().characters.join(', ') }}</p>
      <p class="world-stories">{{ worldLocation().stories.join(', ') }}</p>
      <p class="world-tags">{{ worldLocation().tags.join(', ') }}</p> -->
      <a [routerLink]="['/event-details', worldLocation().id]" class="details-button">Learn More</a>
    </div>
  `,
  styleUrls: ['./world-location.css', '../../styles.css']
})
export class WorldLocation {
    worldLocation = input.required<WorldLocationInfo>();

}
