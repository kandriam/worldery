import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldEventService } from '../services/world-event.service';
import { WorldEventInfo } from '../worldevent';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule],
  template: `
    <article>
      <section class="event-heading">
        <h2 class="event-title">{{ worldEvent?.name }}</h2>
      </section>
      <!-- <div class="event-main event-details">
        <ul>
          <li>Date: {{ worldEvent?.date }}</li>
          <li>Locations: {{ worldEvent?.location?.join(', ') }}</li>
          <li>Characters: {{ worldEvent?.characters?.join(', ') }}</li>
          <li>Stories: {{ worldEvent?.stories?.join(', ') }}</li>
        </ul>
      </div> -->
      <section class="edit-event-form">
        <h2 class="section-heading">Event</h2>
        <form [formGroup]="applyForm" (submit)="submitApplication()">
          <div>
            <label for="event-title">Event Title</label>
            <input id="event-title" type="text" formControlName="eventTitle" />
            <label for="event-date">Event Date</label>
            <input id="event-date" type="text" formControlName="eventDate" />
          </div>
          <label for="event-description">Event Description</label>
          <textarea id="event-description" formControlName="eventDescription"></textarea>
          <div>
            <label for="event-location">Event Location</label>
            <input id="event-location" type="text" formControlName="eventLocation" />
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
  styleUrls: ["./world-event-details.css", "../../styles.css"],
})

export class WorldEventDetails {
  route: ActivatedRoute = inject(ActivatedRoute);
  worldEventService = inject(WorldEventService);
  worldEvent: WorldEventInfo | undefined;

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
    const worldEventId = parseInt(this.route.snapshot.params['id'], 10);
    this.worldEventService.getWorldEventById(worldEventId).then((worldEvent) => {
      this.worldEvent = worldEvent;
      this.applyForm.patchValue({
        eventTitle: worldEvent?.name || '',
        eventDate: worldEvent?.date || '',
        eventDescription: worldEvent?.description || '',
        eventLocation: worldEvent?.location?.join(', ') || '',
        eventCharacters: worldEvent?.characters?.join(', ') || '',
        eventStories: worldEvent?.stories?.join(', ') || '',
        eventTags: worldEvent?.tags?.join(', ') || '',
      });
    });
  }

  submitApplication() {
    if (this.worldEvent?.id !== undefined) {
      this.worldEventService.updateWorldEvent(
        this.worldEvent.id,
        this.applyForm.value.eventTitle ?? '',
        this.applyForm.value.eventDate ?? '',
        this.applyForm.value.eventDescription ?? '',
        this.applyForm.value.eventLocation ?? '',
        this.applyForm.value.eventCharacters ?? '',
        this.applyForm.value.eventStories ?? '',
        this.applyForm.value.eventTags?.split(', ') ?? [],
      );
    }
  }
}
