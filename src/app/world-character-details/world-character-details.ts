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
      <section class="details-heading">
        <h2 class="character-title">{{ worldCharacter?.firstName }} {{ worldCharacter?.lastName }}</h2>
        <h3>( {{ worldCharacter?.altNames?.join(', ') }} )</h3>
      </section>
      <section class="edit-character-form">
        <form [formGroup]="applyForm" (submit)="submitApplication()">
          <div class="details-subsection">
            <label for="character-first-name">Name</label>
            <input id="character-first-name" type="text" formControlName="characterFirstName" />
            <input id="character-last-name" type="text" formControlName="characterLastName" placeholder="Firstname"/>
            
            <label for="character-alt-names">Alternate Names</label>
            <input id="character-alt-names" type="text" formControlName="characterAltNames" />
            
            <label for="character-pronouns">Pronouns</label>
            <input id="character-pronouns" type="text" formControlName="characterPronouns" />
            
            <label for="character-birthdate">Birthdate</label>
            <input id="character-birthdate" type="text" formControlName="characterBirthdate" />
          </div>
          <div class="details-section">
            <label for="character-physical-description">Physical Description</label>
            <textarea id="character-physical-description" formControlName="characterPhysicalDescription"></textarea>
            <label for="character-non-physical-description">Non-Physical Description</label>
            <textarea id="character-non-physical-description" formControlName="characterNonPhysicalDescription"></textarea>
          </div>
          <div class="details-subsection">
            <label for="roles">Roles</label>
            <input id="roles" type="text" formControlName="characterRoles" />
            <label for="character-relationships">Relationships</label>
            <input id="character-relationships" type="text" formControlName="characterRelationships" />
          </div>
          <div class="details-section">
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
    characterFirstName: new FormControl(''),
    characterLastName: new FormControl(''),
    characterAltNames: new FormControl(''),
    characterPronouns: new FormControl(''),
    characterBirthdate: new FormControl(''),
    characterRoles: new FormControl(''),
    characterAffiliations: new FormControl(''),
    characterRelationships: new FormControl(''),
    characterPhysicalDescription: new FormControl(''),
    characterNonPhysicalDescription: new FormControl(''),
    characterStories: new FormControl(''),
    characterTags: new FormControl(''),
    eventTags: new FormControl(''),
  });

  constructor() {
    const worldCharacterId = parseInt(this.route.snapshot.params['id'], 10);
    this.worldCharacterService.getWorldCharacterById(worldCharacterId).then((worldCharacter) => {
      this.worldCharacter = worldCharacter;
      this.applyForm.patchValue({
        characterFirstName: worldCharacter?.firstName || '',
        characterLastName: worldCharacter?.lastName || '',
        characterAltNames: worldCharacter?.altNames?.join(', ') || '',
        characterPronouns: worldCharacter?.pronouns || '',
        characterRoles: worldCharacter?.roles?.join(', ') || '',
        characterAffiliations: worldCharacter?.affiliations?.join(', ') || '',
        characterRelationships: worldCharacter?.relationships?.join(', ') || '',
        characterBirthdate: worldCharacter?.birthdate || '',
        characterPhysicalDescription: worldCharacter?.physicalDescription || '',
        characterNonPhysicalDescription: worldCharacter?.nonPhysicalDescription || '',
        characterStories: worldCharacter?.stories?.join(', ') || '',
        characterTags: worldCharacter?.tags?.join(', ') || '',
      });
    });
  }

  submitApplication() {
    if (this.worldCharacter?.id !== undefined) {
      this.worldCharacterService.updateWorldCharacter(
        this.worldCharacter.id,
        this.applyForm.value.characterFirstName ?? '',
        this.applyForm.value.characterLastName ?? '',
        this.applyForm.value.characterAltNames?.split(', ') ?? [],
        this.applyForm.value.characterPronouns ?? '',
        this.applyForm.value.characterBirthdate ?? '',
        this.applyForm.value.characterRoles?.split(', ') ?? [],
        this.applyForm.value.characterAffiliations?.split(', ') ?? [],
        this.applyForm.value.characterRelationships?.split(', ') ?? [],
        this.applyForm.value.characterPhysicalDescription ?? '',
        this.applyForm.value.characterNonPhysicalDescription ?? '',
        this.applyForm.value.characterStories?.split(', ') ?? [],
        this.applyForm.value.characterTags?.split(', ') ?? [],
      );
    }
  }
}
