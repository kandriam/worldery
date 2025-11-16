import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldCharacterService } from '../services/world-character.service';
import { WorldCharacterInfo } from '../worldcharacter';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { WorldStoryInfo } from '../worldstory';
import { WorldStoryService } from '../services/world-story.service';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule],
  templateUrl: "character-details.html",
  styleUrls: ["./character-details.css", "../../styles.css"],
})

export class WorldCharacterDetails {
  route: ActivatedRoute = inject(ActivatedRoute);
  worldCharacterService = inject(WorldCharacterService);
  worldCharacter: WorldCharacterInfo | undefined;
  characterList = Array<WorldCharacterInfo>();
  worldStoryService = inject(WorldStoryService);
  storyList = Array<WorldStoryInfo>();

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

    this.worldCharacterService.getAllWorldCharacters().then((characters) => {
      this.characterList = characters;
    });

    this.worldStoryService.getAllWorldStories().then((stories) => {
      this.storyList = stories;
    });
  }

  onRelationshipChange(event: Event, characterId: number) {
    // Implement the logic to handle relationship checkbox changes
    this.worldCharacterService.getWorldCharacterById(characterId).then((character) => {
      if (character) {
        console.log(`Relationship toggled for character: ${character.firstName} ${character.lastName}`);
        // Additional logic to update relationships can be added here
      }
    });
  }

  onStoryChange(event: Event, storyId: number) {
    this.worldStoryService.getWorldStoryById(storyId).then((story) => {
      if (story) {
        console.log(`Story toggled: ${story.title}`);
        // Additional logic to update stories can be added here
      }
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
