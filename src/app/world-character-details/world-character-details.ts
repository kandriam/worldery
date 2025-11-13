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
            <label for="character-name">Name</label>
            <input id="character-name" type="text" formControlName="characterName" />
          </div>
          <div>
            <label for="character-alt-names">Alternate Names</label>
            <input id="character-alt-names" type="text" formControlName="characterAltNames" />
            <label for="character-pronouns">Pronouns</label>
            <input id="character-pronouns" type="text" formControlName="characterPronouns" />
            <label for="character-birthdate">Birthdate</label>
            <input id="character-birthdate" type="text" formControlName="characterBirthdate" />
          </div>
          <div>
            <label for="character-description">Description</label>
            <textarea id="character-description" formControlName="characterDescription"></textarea>
          </div>
          <div>
            <label for="roles">Roles</label>
            <input id="roles" type="text" formControlName="characterRoles" />
            <label for="character-relationships">Relationships</label>
            <input id="character-relationships" type="text" formControlName="characterRelationships" />
          </div>
          <div>
            <label for="character-affiliations">Affiliations</label>
            <input id="character-affiliations" type="text" formControlName="characterAffiliations" />
            <label for="character-stories">Stories</label>
            <input id="character-stories" type="text" formControlName="characterStories" />
            <label for="character-tags">Tags</label>
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
    characterRoles: new FormControl(''),
    characterAffiliations: new FormControl(''),
    characterRelationships: new FormControl(''),
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
        characterRoles: worldCharacter?.roles?.join(', ') || '',
        characterAffiliations: worldCharacter?.affiliations?.join(', ') || '',
        characterRelationships: worldCharacter?.relationships?.join(', ') || '',
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
        this.applyForm.value.characterRoles?.split(', ') ?? [],
        this.applyForm.value.characterAffiliations?.split(', ') ?? [],
        this.applyForm.value.characterRelationships?.split(', ') ?? [],
        this.applyForm.value.characterDescription ?? '',
        this.applyForm.value.characterStories?.split(', ') ?? [],
        this.applyForm.value.characterTags?.split(', ') ?? [],
      );
    }
  }
}
