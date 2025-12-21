import {Component, inject, input, output} from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import {WorldCharacterInfo} from '../../../worldcharacter';
import {RouterLink } from '@angular/router';
import { WorldCharacterService } from '../../../services/world-character.service';
import { WorldStoryService } from 'src/app/services/world-story.service';

@Component({
  selector: 'app-character-thumbnail',
  imports: [RouterLink],
  templateUrl: 'character-thumbnail.html',
  styleUrls: ['character-thumbnail.css', '../thumbnail.css'],
})

export class CharacterThumbnail {
  characterService = inject(WorldCharacterService);
  settingsService = inject(SettingsService);
  worldCharacter = input.required<WorldCharacterInfo>();
  showDate = input<boolean>(true);
  showLocation = input<boolean>(true);
  showCharacters = input<boolean>(true);
  showStories = input<boolean>(true);
  
  tagClicked = output<string>();
  storyService = inject(WorldStoryService);

  characterNames: string[] = [];
  storyTitles: string[] = [];

  async ngOnInit() {
    // Resolve story IDs to titles
    const allStories = await this.storyService.getAllWorldStories();
    this.storyTitles = (this.worldCharacter().stories || []).map(id => {
      const s = allStories.find((story: any) => story.id === id);
      return s ? s.title : id;
    });
  }

  deleteCharacter(id: string, event: Event) {
    event.stopPropagation();
    console.log(`Delete character with ID: ${id}`);
    this.characterService.deleteWorldCharacter(id);
  }
  
  onTagClick(tag: string, event: Event) {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
  get formattedBirthdate(): string | null {
    const date = this.worldCharacter().birthdate;
    if (!date) return null;
    return this.settingsService.formatDate(date);
  }
}
