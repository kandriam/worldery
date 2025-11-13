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
      <section class="listing-description">
        <h2 class="listing-heading">{{ worldEvent?.name }}</h2>
        <!-- <p class="listing-location">{{ worldEvent?.location.join(', ') }}</p> -->
      </section>
      <section class="listing-features">
        <h2 class="section-heading">About this world event</h2>
        <ul>
          <li>Date: {{ worldEvent?.date }}</li>
          <!-- <li>Characters: {{ worldEvent?.characters.join(', ') }}</li> -->
          <!-- <li>Stories: {{ worldEvent?.stories.join(', ') }}</li> -->
        </ul>
      </section>
      <section class="listing-apply">
        <h2 class="section-heading">Apply now to live here</h2>
        <form [formGroup]="applyForm" (submit)="submitApplication()">
          <label for="first-name">First Name</label>
          <input id="first-name" type="text" formControlName="firstName" />
          <label for="last-name">Last Name</label>
          <input id="last-name" type="text" formControlName="lastName" />
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" />
          <button type="submit" class="primary">Apply now</button>
        </form>
      </section>
    </article>
  `,
  styles: ``
})

export class Details {
  route: ActivatedRoute = inject(ActivatedRoute);
  worldEventService = inject(WorldEventService);
  worldEvent: WorldEventInfo | undefined;

  applyForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
  });

  constructor() {
    const worldEventId = parseInt(this.route.snapshot.params['id'], 10);
    this.worldEventService.getWorldEventById(worldEventId).then((worldEvent) => {
      this.worldEvent = worldEvent;
    });
  }

  submitApplication() {
    this.worldEventService.submitApplication(
      this.applyForm.value.firstName ?? '',
      this.applyForm.value.lastName ?? '',
      this.applyForm.value.email ?? '',
    );
  }
}
