import {Component, input} from '@angular/core';
import {WorldEventInfo} from '../worldevent';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-event',
  imports: [RouterLink, RouterOutlet],
  templateUrl: 'world-event.html',
  styleUrls: ['./world-event.css', '../../styles.css'],
})

export class WorldEvent {
  worldEvent = input.required<WorldEventInfo>();
}
