import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldEventService } from '../services/world-event.service';
import { WorldEventInfo } from '../worldevent';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule],
  templateUrl: 'event-details.html',
  styleUrls: ["./event-details.css", "../../styles.css"],
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
