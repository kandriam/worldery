import {Component, input} from '@angular/core';
import {WorldEventInfo} from '../worldevent';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-event',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="event-thumbnail world-thumbnail" [routerLink]="['/event-details', worldEvent().id]">
      <h4 class="thumbnail-title">{{ worldEvent().name }}</h4>
      <p class="world-date">{{ worldEvent().date }}</p>
      <div class="world-description">{{ worldEvent().description }}</div>
      <!-- <p class="world-location">{{ worldEvent().location.join(', ') }}</p>
      <p class="world-characters">{{ worldEvent().characters.join(', ') }}</p>
      <p class="world-stories">{{ worldEvent().stories.join(', ') }}</p> -->
      <div class="thumbnail-tag-container">
        @for (tag of worldEvent().tags; track tag) {
          <div class="world-tags">{{ tag }}</div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./world-event.css', '../../styles.css'],
})

export class WorldEvent {
  worldEvent = input.required<WorldEventInfo>();
}
