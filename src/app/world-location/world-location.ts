import { Component, input } from '@angular/core';
import { WorldLocationInfo } from '../worldlocation';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-location',
  imports: [RouterLink, RouterOutlet],
  templateUrl: 'world-location.html',
  styleUrls: ['./world-location.css', '../../styles.css']
})
export class WorldLocation {
    worldLocation = input.required<WorldLocationInfo>();

}
