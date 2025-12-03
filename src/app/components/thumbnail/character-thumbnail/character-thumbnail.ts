import {Component, inject, input} from '@angular/core';
import {WorldCharacterInfo} from '../../../worldcharacter';
import {RouterLink } from '@angular/router';
import { WorldCharacterService } from '../../../services/world-character.service';

@Component({
  selector: 'app-character-thumbnail',
  imports: [RouterLink],
  templateUrl: 'character-thumbnail.html',
  styleUrls: ['character-thumbnail.css', '../thumbnail.css'],
})

export class CharacterThumbnail {
  characterService = inject(WorldCharacterService);
  worldCharacter = input.required<WorldCharacterInfo>();

  deleteCharacter(id: number, event: Event) {
    event.stopPropagation();
    console.log(`Delete character with ID: ${id}`);
    this.characterService.deleteWorldCharacter(id);
  }
}
