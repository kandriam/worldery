import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldLocationService } from '../../services/world-location.service';
import { WorldLocationInfo } from '../../worldlocation';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule],
  templateUrl: 'location-details.html',
  styleUrls: ["location-details.css", "../details.css", "../../../styles.css"],
})

export class WorldLocationDetails {
  route: ActivatedRoute = inject(ActivatedRoute);
  worldLocationService = inject(WorldLocationService);
  worldLocation: WorldLocationInfo | undefined;

  applyForm = new FormGroup({
    locationTitle: new FormControl(''),
    locationDate: new FormControl(''),
    locationDescription: new FormControl(''),
    locationLocation: new FormControl(''),
    locationCharacters: new FormControl(''),
    locationStories: new FormControl(''),
    locationTags: new FormControl(''),
  });

  constructor() {
    const worldLocationId = parseInt(this.route.snapshot.params['id'], 10);
    this.worldLocationService.getWorldLocationById(worldLocationId).then((worldLocation) => {
      this.worldLocation = worldLocation;
      this.applyForm.patchValue({
        locationTitle: worldLocation?.name || '',
        locationDescription: worldLocation?.description || '',
        locationCharacters: worldLocation?.characters?.join(', ') || '',
        locationStories: worldLocation?.stories?.join(', ') || '',
        locationTags: worldLocation?.tags?.join(', ') || '',
      });
    });
  }

  submitApplication() {
    if (this.worldLocation?.id !== undefined) {
      this.worldLocationService.updateWorldLocation(
        this.worldLocation.id,
        this.applyForm.value.locationTitle ?? '',
        this.applyForm.value.locationDescription ?? '',
        this.applyForm.value.locationCharacters?.split(', ') ?? [],
        this.applyForm.value.locationStories?.split(', ') ?? [] ,
        this.applyForm.value.locationTags?.split(', ') ?? [],
      );
    }
  }
}
