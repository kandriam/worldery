import {Component, input} from '@angular/core';
import {WorldCharacterInfo} from '../worldcharacter';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-character',
  imports: [RouterLink, RouterOutlet],
  templateUrl: 'world-character.html',
  styleUrls: ['./world-character.css', '../../styles.css'],
})

export class WorldCharacter {
  worldCharacter = input.required<WorldCharacterInfo>();
}
