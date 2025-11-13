import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldLocationService } from '../services/world-location.service';
import { WorldLocationInfo } from '../worldlocation';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule],
  template: `
    <article>
      <section class="event-heading">
        <h2 class="event-title">{{ worldLocation?.name }}</h2>
      </section>
      <section class="edit-event-form">
        <h2 class="section-heading">Basic Details</h2>
        <form [formGroup]="applyForm" (submit)="submitApplication()">
          <div>
            <label for="event-title">Event Title</label>
            <input id="event-title" type="text" formControlName="eventTitle" />
          </div>
          <label for="event-description">Event Description</label>
          <textarea id="event-description" formControlName="eventDescription"></textarea>
          <div>
            <label for="event-characters">Event Characters</label>
            <input id="event-characters" type="text" formControlName="eventCharacters" />
            <label for="event-stories">Event Stories</label>
            <input id="event-stories" type="text" formControlName="eventStories" />
            <label for="event-tags">Event Tags</label>
            <input id="event-tags" type="text" formControlName="eventTags" />
          </div>
          <button type="submit" class="primary">Save Details</button>
        </form>
      </section>
    </article>
  `,
  styleUrls: ["./world-location-details.css", "../../styles.css"],
})

export class WorldLocationDetails {
  route: ActivatedRoute = inject(ActivatedRoute);
  worldLocationService = inject(WorldLocationService);
  worldLocation: WorldLocationInfo | undefined;

  applyForm = new FormGroup({
    eventTitle: new FormControl(''),
    eventDate: new FormControl(''),
    eventDescription: new FormControl(''),
    eventLocation: new FormControl(''),
    eventCharacters: new FormControl(''),
    eventStories: new FormControl(''),
    eventTags: new FormControl(''),
  });

  constructor() {
    const worldLocationId = parseInt(this.route.snapshot.params['id'], 10);
    this.worldLocationService.getWorldLocationById(worldLocationId).then((worldLocation) => {
      this.worldLocation = worldLocation;
      this.applyForm.patchValue({
        eventTitle: worldLocation?.name || '',
        eventDescription: worldLocation?.description || '',
        eventCharacters: worldLocation?.characters?.join(', ') || '',
        eventStories: worldLocation?.stories?.join(', ') || '',
        eventTags: worldLocation?.tags?.join(', ') || '',
      });
    });
  }

  submitApplication() {
    if (this.worldLocation?.id !== undefined) {
      this.worldLocationService.updateWorldLocation(
        this.worldLocation.id,
        this.applyForm.value.eventTitle ?? '',
        this.applyForm.value.eventDescription ?? '',
        this.applyForm.value.eventCharacters?.split(', ') ?? [],
        this.applyForm.value.eventStories?.split(', ') ?? [] ,
        this.applyForm.value.eventTags?.split(', ') ?? [],
      );
    }
  }
}
