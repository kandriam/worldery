import { Component, input, inject } from '@angular/core';
import { WorldLocationInfo } from '../worldlocation';
import {RouterLink, RouterOutlet } from '@angular/router';
import { WorldLocationService } from '../services/world-location.service';
@Component({
  selector: 'app-world-location',
  imports: [RouterLink, RouterOutlet],
  templateUrl: 'world-location.html',
  styleUrls: ['./world-location.css', '../../styles.css']
})
export class WorldLocation {
  locationService = inject(WorldLocationService);
  worldLocation = input.required<WorldLocationInfo>();

  deleteLocation(id: number, event: Event) {
    event.stopPropagation();
    console.log(`Delete location with ID: ${id}`);
    this.locationService.deleteWorldLocation(id);
  }
}
