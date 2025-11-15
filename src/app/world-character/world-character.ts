import {Component, input, inject} from '@angular/core';
import {WorldCharacterInfo} from '../worldcharacter';
import {RouterLink, RouterOutlet } from '@angular/router';
import { WorldCharacterService } from '../services/world-character.service';

@Component({
  selector: 'app-world-character',
  imports: [RouterLink, RouterOutlet],
  templateUrl: 'world-character.html',
  styleUrls: ['./world-character.css', '../../styles.css'],
})

export class WorldCharacter {
  characterService = inject(WorldCharacterService);
  worldCharacter = input.required<WorldCharacterInfo>();

  deleteCharacter(id: number, event: Event) {
    event.stopPropagation();
    console.log(`Delete location with ID: ${id}`);
    this.characterService.deleteWorldCharacter(id);
  }
}
