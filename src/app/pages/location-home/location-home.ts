import {Component, inject} from '@angular/core';
import {LocationThumbnail} from '../../thumbnail/location-thumbnail/location-thumbnail';
import {WorldLocationInfo} from '../../worldlocation';
import {WorldLocationService} from '../../services/world-location.service';

@Component({
  selector: 'app-location-home',
  imports: [LocationThumbnail],
  templateUrl: 'location-home.html',
  styleUrls: ['../pages.css', 'location-home.css', '../../../styles.css'],
})

export class LocationHome {
  locationService: WorldLocationService = inject(WorldLocationService);
  filteredLocationList: WorldLocationInfo[] = [];
  worldLocationList: WorldLocationInfo[] = [];

  constructor() {
    this.locationService
      .getAllWorldLocations()
      .then((worldLocationList: WorldLocationInfo[]) => {
        this.worldLocationList = worldLocationList;
        this.filteredLocationList = worldLocationList;
      });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList = this.worldLocationList;
      return;
    }
    
    this.filteredLocationList = this.worldLocationList.filter((worldLocation) =>
      worldLocation?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldLocation?.name.toLowerCase().includes(text.toLowerCase()) ||
      worldLocation?.description.toLowerCase().includes(text.toLowerCase()),
    );
  }

  addWorldLocation() {
    console.log('Adding new location');
    this.locationService.createWorldLocation('New Location', '', [], [], []);
  }
}