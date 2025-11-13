import {Component, input} from '@angular/core';
import {WorldEventInfo} from '../worldevent';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-event',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="event-container">
      <h4 class="event-heading">{{ worldEvent().name }}</h4>
      <p class="event-date">{{ worldEvent().date }}</p>
      <p class="event-description">{{ worldEvent().description }}</p>
      <!-- <p class="event-location">{{ worldEvent().location.join(', ') }}</p>
      <p class="event-characters">{{ worldEvent().characters.join(', ') }}</p>
      <p class="event-stories">{{ worldEvent().stories.join(', ') }}</p>
      <p class="event-tags">{{ worldEvent().tags.join(', ') }}</p> -->
      <a [routerLink]="['/event-details', worldEvent().id]" class="details-button">Learn More</a>
    </div>
  `,
  styleUrls: ['./world-event.css', '../../styles.css'],
})

export class WorldEvent {
  worldEvent = input.required<WorldEventInfo>();
}
