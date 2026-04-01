import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import { Component, inject, input, output } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { WorldStoryInfo } from '../../../services/world-story.service';
import { WorldLocationService } from '../../../services/world-location.service';  
import { WorldCharacterService } from '../../../services/world-character.service';
import { RouterLink } from '@angular/router';
import { WorldStoryService } from '../../../services/world-story.service';
import { WorldInfo } from '../../../services/world.service';

@Component({
  selector: 'app-world-thumbnail',
  imports: [RouterLink,],
  templateUrl: 'world-thumbnail.html',
  styleUrls: ['world-thumbnail.css', '../thumbnail.css'],
})

export class WorldThumbnail {
  storyService = inject(WorldStoryService);
  locationService = inject(WorldLocationService);
  characterService = inject(WorldCharacterService);
  settingsService = inject(SettingsService);
  world = input.required<WorldInfo>();
  showGenres = input<boolean>(true);
  showOwner = input<boolean>(true);
  showDescription = input<boolean>(true);
  tagClicked = output<string>();

  onTagClick(tag: string, event: Event) {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
}
