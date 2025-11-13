import {Component, input} from '@angular/core';
import {WorldCharacterInfo} from '../worldcharacter';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-world-character',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="character-container" [routerLink]="['/character-details', worldCharacter().id]">
      <h4 class="character-heading">{{ worldCharacter().name }}</h4>
      <p class="character-alt-names">{{ worldCharacter().altNames.join(', ') }}</p>
      <p class="character-pronouns">{{ worldCharacter().pronouns }}</p>
      <p class="character-description">{{ worldCharacter().description }}</p>
      <a [routerLink]="['/character-details', worldCharacter().id]" class="details-button">Learn More</a>
    </div>
  `,
  styleUrls: ['./world-character.css', '../../styles.css'],
})

export class WorldCharacter {
  worldCharacter = input.required<WorldCharacterInfo>();
}
