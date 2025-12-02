import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldStoryService } from '../../services/world-story.service';
import { WorldStoryInfo } from '../../worldstory';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule],
  templateUrl: 'story-details.html',
  styleUrls: ["story-details.css", "../details.css", "../../../styles.css"],
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
