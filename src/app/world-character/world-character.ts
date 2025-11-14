import {Component, input} from '@angular/core';
import {WorldCharacterInfo} from '../worldcharacter';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-character',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="character-container" [routerLink]="['/character-details', worldCharacter().id]">
      <h4 class="character-heading">{{ worldCharacter().firstName }} {{ worldCharacter().lastName }} </h4>
      <p class="character-alt-names">{{ worldCharacter().altNames.join(', ') }}</p>
      <p class="character-pronouns">{{ worldCharacter().pronouns }}</p>
      @for (tag of worldCharacter().tags; track tag) {
        <span class="home-tags">{{ tag }}</span>
      }
    </div>
  `,
  styleUrls: ['./world-character.css', '../../styles.css'],
})

export class WorldCharacter {
  worldCharacter = input.required<WorldCharacterInfo>();
}
