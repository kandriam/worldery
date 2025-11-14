import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldStoryService } from '../services/world-story.service';
import { WorldStoryInfo } from '../worldstory';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule],
  template: `
    <article>
      <section class="details-heading">
        <h2 class="story-title">{{ worldStory?.title }}</h2>
      </section>
      <section class="edit-story-form">
        <form [formGroup]="applyForm" (submit)="submitApplication()">
          <div>
            <label for="story-title">Story Title</label>
            <input id="story-title" type="text" formControlName="storyTitle" />
          </div>
          <label for="story-description">Story Description</label>
          <textarea id="story-description" formControlName="storyDescription"></textarea>
          <div>
            <label for="story-characters">Story Characters</label>
            <input id="story-characters" type="text" formControlName="storyCharacters" />
            <label for="story-locations">Story Locations</label>
            <input id="story-locations" type="text" formControlName="storyLocations" />
            <label for="story-tags">Story Tags</label>
            <input id="story-tags" type="text" formControlName="storyTags" />
          </div>
          <button type="submit" class="primary">Save Details</button>
        </form>
      </section>
    </article>
  `,
  styleUrls: ["./world-story-details.css", "../../styles.css"],
})

export class WorldStoryDetails {
  route: ActivatedRoute = inject(ActivatedRoute);
  worldStoryService = inject(WorldStoryService);
  worldStory: WorldStoryInfo | undefined;

  applyForm = new FormGroup({
    storyTitle: new FormControl(''),
    storyDate: new FormControl(''),
    storyDescription: new FormControl(''),
    storyCharacters: new FormControl(''),
    storyLocations: new FormControl(''),
    storyTags: new FormControl(''),
  });

  constructor() {
    const worldStoryId = parseInt(this.route.snapshot.params['id'], 10);
    this.worldStoryService.getWorldStoryById(worldStoryId).then((worldStory) => {
      this.worldStory = worldStory;
      this.applyForm.patchValue({
        storyTitle: worldStory?.title || '',
        storyDescription: worldStory?.description || '',
        storyCharacters: worldStory?.characters?.join(', ') || '',
        storyLocations: worldStory?.locations?.join(', ') || '',
        storyTags: worldStory?.tags?.join(', ') || '',
      });
    });
  }

  submitApplication() {
    if (this.worldStory?.id !== undefined) {
      this.worldStoryService.updateWorldStory(
        this.worldStory.id,
        this.applyForm.value.storyTitle ?? '',
        this.applyForm.value.storyDescription ?? '',
        this.applyForm.value.storyCharacters?.split(', ') ?? [],
        this.applyForm.value.storyLocations?.split(', ') ?? [] ,
        this.applyForm.value.storyTags?.split(', ') ?? [],
      );
    }
  }
}
