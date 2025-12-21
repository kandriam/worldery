import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import {Component, inject, input, output} from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { NgClass } from '@angular/common';
import {WorldStoryInfo} from '../../../worldstory';
import { WorldLocationService } from '../../../services/world-location.service';  
import { WorldCharacterService } from '../../../services/world-character.service';
import {RouterLink } from '@angular/router';
import { WorldStoryService } from '../../../services/world-story.service';
import { SubstoryThumbnailComponent } from './substory-thumbnail/substory-thumbnail.component';
@Component({
  selector: 'app-story-thumbnail',
  imports: [RouterLink, SubstoryThumbnailComponent, NgClass],
  templateUrl: 'story-thumbnail.html',
  styleUrls: ['story-thumbnail.css', '../thumbnail.css'],
})

export class StoryThumbnail {
  storyService = inject(WorldStoryService);
  locationService = inject(WorldLocationService);
  characterService = inject(WorldCharacterService);
  settingsService = inject(SettingsService);
  worldStory = input.required<WorldStoryInfo>();
  showDate = input<boolean>(true);
  showLocation = input<boolean>(true);
  showCharacters = input<boolean>(true);
  showStories = input<boolean>(true);

  tagClicked = output<string>();

  substories: WorldStoryInfo[] = [];
  characterNames: string[] = [];
  locationNames: string[] = [];
  @ViewChild('substoriesRow', { static: false }) substoriesRowRef?: ElementRef<HTMLDivElement>;
  @ViewChild('root', { static: false }) rootRef?: ElementRef<HTMLDivElement>;
  ngAfterViewInit() {
    this.adjustWidthToSubstories();
  }

  async adjustWidthToSubstories() {
    // Wait for substories to render
    setTimeout(() => {
      if (this.substoriesRowRef && this.rootRef) {
        const substoriesEl = this.substoriesRowRef.nativeElement;
        const rootEl = this.rootRef.nativeElement;
        if (substoriesEl && rootEl) {
          const substoriesWidth = substoriesEl.offsetWidth;
          // Only grow, never shrink below 15rem
          rootEl.style.width = Math.max(substoriesWidth, 240) + 'px';
        }
      }
    }, 0);
  }
  async ngOnInit() {
    // Resolve related location IDs to names
    const allLocations = await this.locationService.getAllWorldLocations();
    this.locationNames = (this.worldStory().locations || []).map(id => {
      const loc = allLocations.find((location: any) => location.id === id);
      return loc ? loc.name : id;
    });

    // Resolve character IDs to names
    const allCharacters = await this.characterService.getAllWorldCharacters();
    this.characterNames = (this.worldStory().characters || []).map(id => {
      const c = allCharacters.find((char: any) => char.id === id);
      return c ? `${c.firstName} ${c.lastName}` : id;
    });

    // Populate substories with WorldStoryInfo objects
    if (this.worldStory().substories && this.worldStory().substories.length > 0) {
      const allStories = await this.storyService.getAllWorldStories();
      this.substories = this.worldStory().substories
        .map(id => allStories.find(story => story.id === id))
        .filter((story): story is WorldStoryInfo => !!story);
    }
  }


  deleteStory(id: string, event: Event) {
    event.stopPropagation();
    console.log(`Delete story with ID: ${id}`);
    this.storyService.deleteWorldStory(id);
  }

  onTagClick(tag: string, event: Event) {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
  // get formattedDate(): string | null {
  //   const date = this.worldStory().date;
  //   if (!date) return null;
  //   return this.settingsService.formatDate(date);
  // }
}
