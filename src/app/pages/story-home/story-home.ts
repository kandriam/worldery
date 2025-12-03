import {Component, inject} from '@angular/core';
import {StoryThumbnail} from '../../thumbnail/story-thumbnail/story-thumbnail';
import {WorldStoryInfo} from '../../worldstory';
import {WorldStoryService} from '../../services/world-story.service';

@Component({
  selector: 'app-story-home',
  imports: [StoryThumbnail],
  templateUrl: 'story-home.html',
  styleUrls: ['../pages.css', 'story-home.css', '../../../styles.css'],
})

export class StoryHome {
  storyService: WorldStoryService = inject(WorldStoryService);
  filteredStoryList: WorldStoryInfo[] = [];
  worldStoryList: WorldStoryInfo[] = [];

  constructor() {
    this.storyService
      .getAllWorldStories()
      .then((worldStoryList: WorldStoryInfo[]) => {
        this.worldStoryList = worldStoryList;
        this.filteredStoryList = worldStoryList;
      });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredStoryList = this.worldStoryList;
      return;
    }
    
    this.filteredStoryList = this.worldStoryList.filter((worldStory) =>
      worldStory?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldStory?.title.toLowerCase().includes(text.toLowerCase()) ||
      worldStory?.description.toLowerCase().includes(text.toLowerCase()),
    );
  }

  addWorldStory() {
    console.log('Adding new story');
    this.storyService.createWorldStory('New Story', '', [], [], []);
  }
}