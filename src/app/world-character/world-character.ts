import {Component, input} from '@angular/core';
import {WorldCharacterInfo} from '../worldcharacter';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-character',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="character-thumbnail world-thumbnail" [routerLink]="['/character-details', worldCharacter().id]">
      <h4 class="thumbnail-title">{{ worldCharacter().firstName }} {{ worldCharacter().lastName }} </h4>
      <p class="thumbnail-alt-names">{{ worldCharacter().altNames.join(', ') }}</p>
      <p class="thumbnail-pronouns">{{ worldCharacter().pronouns }}</p>
      <div class="thumbnail-tag-container">
        @for (tag of worldCharacter().tags; track tag) {
          <div class="world-tags">{{ tag }}</div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./world-character.css', '../../styles.css'],
})

export class WorldCharacter {
  worldCharacter = input.required<WorldCharacterInfo>();
}
