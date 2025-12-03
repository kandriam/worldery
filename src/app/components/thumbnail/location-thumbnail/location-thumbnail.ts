import { Component, input, inject } from '@angular/core';
import { WorldLocationInfo } from '../../../worldlocation';
import {RouterLink } from '@angular/router';
import { WorldLocationService } from '../../../services/world-location.service';
@Component({
  selector: 'app-location-thumbnail',
  imports: [RouterLink],
  templateUrl: 'location-thumbnail.html',
  styleUrls: ['location-thumbnail.css', '../thumbnail.css']
})
export class LocationThumbnail {
  locationService = inject(WorldLocationService);
  worldLocation = input.required<WorldLocationInfo>();

  deleteLocation(id: number, event: Event) {
    event.stopPropagation();
    console.log(`Delete location with ID: ${id}`);
    this.locationService.deleteWorldLocation(id);
  }
}
