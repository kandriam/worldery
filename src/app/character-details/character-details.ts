import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorldCharacterService } from '../services/world-character.service';
import { WorldCharacterInfo, worldCharacterRelationship } from '../worldcharacter';
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
      for (let character of this.characterList) {
        if (this.getRelationship(character.id)?.hasRelationship == true) {
          let element = document.getElementById(`relationship-description-${character.id}`) as HTMLElement;
          console.log(element);
          // element.classList.remove('hidden');
          // console.log(`Relationship between ${this.worldCharacter?.firstName} and ${character.firstName}:`, this.getRelationship(character.id));
        }
      }
    });

    this.worldStoryService.getAllWorldStories().then((stories) => {
      this.storyList = stories;
    });

    console.log("Character Relationships Initialized:");
    
  }

  toggleRelationship(event: Event, characterId: number) {
    console.log(`Toggling relationship for character ID: ${characterId}`);
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Checkbox is now: ${isChecked}`);
      let relationshipDescription = document.getElementById(`relationship-description-${characterId}`) as HTMLTextAreaElement;
      if (isChecked) {
        relationshipDescription.classList.remove('hidden');
    }
    else {
        relationshipDescription.classList.add('hidden');
      }
    }
  }

  getRelationship(characterID: number): worldCharacterRelationship | undefined {
    return this.worldCharacter?.relationships?.find(r => r.relatedCharacterID === characterID.toString());
  }

  onRelationshipChange(event: Event, characterId: number) {
    this.worldCharacterService.getWorldCharacterById(characterId).then((character) => {
      if (event.target instanceof HTMLInputElement) {
        const isChecked = event.target.checked;
        console.log(`Checkbox is now: ${isChecked}`);
        if (isChecked) {
          console.log(`Adding relationship to: ${character?.firstName} ${character?.lastName}`);
          // Additional logic to add relationship can be added here
          // this.worldCharacterService.updateCharacterRelationship()
        } else {
          console.log(`Removing relationship to: ${character?.firstName} ${character?.lastName}`);
          // Additional logic to remove relationship can be added here
        }
      }
    });
  }

  getFormRelationship(characterID: number): worldCharacterRelationship | undefined {
    let relationshipCheckbox = document.getElementById(`relationship-checkbox-${characterID}`) as HTMLInputElement;
    let isChecked = relationshipCheckbox.checked;
    let relationshipTypeInput = document.getElementById(`relationship-type-${characterID}`) as HTMLInputElement;
    let relationshipTypes = relationshipTypeInput.value.split(',').map(type => type.trim());
    let relationshipDescription = document.getElementById(`relationship-description-${characterID}`) as HTMLTextAreaElement;
    let descriptionText = relationshipDescription.value;
    console.log(`RelatedCharacterID: ${characterID}, HasRelationship: ${isChecked}, RelationshipDescription: ${descriptionText}`);
    return {
      relatedCharacterID: characterID.toString(),
      relationshipType: relationshipTypes,
      hasRelationship: isChecked,
      relationshipDescription: descriptionText
    };
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
    let relationships: worldCharacterRelationship[] = [];
    for (let character of this.characterList) {
      if (character.id !== this.worldCharacter?.id) {
        let updatedRelationship = this.getFormRelationship(character.id);
        if (updatedRelationship) {
          relationships.push(updatedRelationship);
        }
      }
    }
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
        relationships,
        this.applyForm.value.characterPhysicalDescription ?? '',
        this.applyForm.value.characterNonPhysicalDescription ?? '',
        this.applyForm.value.characterStories?.split(', ') ?? [],
        this.applyForm.value.characterTags?.split(', ') ?? [],
      );
    }
  }
}
