import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldCharacterService } from '../services/world-character.service';
import { WorldCharacterInfo } from '../worldcharacter';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule],
  template: `
    <article>
      <section class="character-heading">
        <h2 class="character-title">{{ worldCharacter?.name }}</h2>
      </section>
      <section class="edit-character-form">
        <h2 class="section-heading">Basic Details</h2>
        <form [formGroup]="applyForm" (submit)="submitApplication()">
          <div>
            <label for="character-name">Character Name</label>
            <input id="character-name" type="text" formControlName="characterName" />
          </div>
          <div>
            <label for="character-alt-names">Character Alternate Names</label>
            <input id="character-alt-names" type="text" formControlName="characterAltNames" />
            <label for="character-pronouns">Character Pronouns</label>
            <input id="character-pronouns" type="text" formControlName="characterPronouns" />
            <label for="character-birthdate">Character Birthdate</label>
            <input id="character-birthdate" type="text" formControlName="characterBirthdate" />
          </div>
          <div>
            <label for="character-description">Character Description</label>
            <textarea id="character-description" formControlName="characterDescription"></textarea>
          </div>
          <div>
            <label for="character-stories">Character Stories</label>
            <input id="character-stories" type="text" formControlName="characterStories" />
            <label for="character-tags">Character Tags</label>
            <input id="character-tags" type="text" formControlName="characterTags" />
          </div>
          <button type="submit" class="primary">Save Details</button>
        </form>
      </section>
    </article>
  `,
  styleUrls: ["./world-character-details.css", "../../styles.css"],
})

export class WorldCharacterDetails {
  route: ActivatedRoute = inject(ActivatedRoute);
  worldCharacterService = inject(WorldCharacterService);
  worldCharacter: WorldCharacterInfo | undefined;

  applyForm = new FormGroup({
    characterName: new FormControl(''),
    characterAltNames: new FormControl(''),
    characterPronouns: new FormControl(''),
    characterBirthdate: new FormControl(''),
    characterDescription: new FormControl(''),
    characterStories: new FormControl(''),
    characterTags: new FormControl(''),
    eventTags: new FormControl(''),
  });

  constructor() {
    const worldCharacterId = parseInt(this.route.snapshot.params['id'], 10);
    this.worldCharacterService.getWorldCharacterById(worldCharacterId).then((worldCharacter) => {
      this.worldCharacter = worldCharacter;
      this.applyForm.patchValue({
        characterName: worldCharacter?.name || '',
        characterAltNames: worldCharacter?.altNames?.join(', ') || '',
        characterPronouns: worldCharacter?.pronouns || '',
        characterBirthdate: worldCharacter?.birthdate || '',
        characterDescription: worldCharacter?.description || '',
        characterStories: worldCharacter?.stories?.join(', ') || '',
        characterTags: worldCharacter?.tags?.join(', ') || '',
      });
    });
  }

  submitApplication() {
    if (this.worldCharacter?.id !== undefined) {
      this.worldCharacterService.updateWorldCharacter(
        this.worldCharacter.id,
        this.applyForm.value.characterName ?? '',
        this.applyForm.value.characterAltNames?.split(', ') ?? [],
        this.applyForm.value.characterPronouns ?? '',
        this.applyForm.value.characterBirthdate ?? '',
        this.applyForm.value.characterDescription ?? '',
        this.applyForm.value.characterStories?.split(', ') ?? [],
        this.applyForm.value.characterTags?.split(', ') ?? [],
      );
    }
  }
}
