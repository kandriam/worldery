import {Component, input} from '@angular/core';
import {WorldStoryInfo} from '../worldstory';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-story',
  imports: [RouterLink, RouterOutlet],
  templateUrl: 'world-story.html',
  styleUrls: ['./world-story.css', '../../styles.css'],
})

export class WorldStory {
  worldStory = input.required<WorldStoryInfo>();
}
