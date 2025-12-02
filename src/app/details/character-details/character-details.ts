import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WorldCharacterService } from '../../services/world-character.service';
import { WorldCharacterInfo, worldCharacterRelationship } from '../../worldcharacter';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { WorldStoryInfo } from '../../worldstory';
import { WorldStoryService } from '../../services/world-story.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "character-details.html",
  styleUrls: ["character-details.css", "../details.css", "../../../styles.css"],
})

export class WorldCharacterDetails implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  worldCharacterService = inject(WorldCharacterService);
  worldCharacter: WorldCharacterInfo | undefined;
  characterList = Array<WorldCharacterInfo>();
  worldStoryService = inject(WorldStoryService);
  storyList = Array<WorldStoryInfo>();
  private routeSubscription: Subscription | undefined;

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
    // Moved initialization logic to ngOnInit
  }

  ngOnInit() {
    // Subscribe to route parameter changes
    this.routeSubscription = this.route.params.subscribe(params => {
      const worldCharacterId = parseInt(params['id'], 10);
      this.loadCharacterData(worldCharacterId);
    });

    // Load shared data that doesn't depend on the current character
    this.loadSharedData();
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private loadCharacterData(worldCharacterId: number) {
    this.worldCharacterService.getWorldCharacterById(worldCharacterId).then((worldCharacter) => {
      this.worldCharacter = worldCharacter;
      this.applyForm.patchValue({
        characterFirstName: worldCharacter?.firstName || '',
        characterLastName: worldCharacter?.lastName || '',
        characterAltNames: worldCharacter?.altNames?.join(', ') || '',
        characterPronouns: worldCharacter?.pronouns || '',
        characterBirthdate: worldCharacter?.birthdate || '',
        characterRoles: worldCharacter?.roles?.join(', ') || '',
        characterAffiliations: worldCharacter?.affiliations?.join(', ') || '',
        characterRelationships: worldCharacter?.relationships?.join(', ') || '',
        characterPhysicalDescription: worldCharacter?.physicalDescription || '',
        characterNonPhysicalDescription: worldCharacter?.nonPhysicalDescription || '',
        characterStories: worldCharacter?.stories?.join(', ') || '',
        characterTags: worldCharacter?.tags?.join(', ') || '',
      });
      
      // Update relationship checkboxes after character data loads
      this.updateRelationshipUI();
    });

    console.log("Character data loaded for ID:", worldCharacterId);
  }

  private loadSharedData() {
    this.worldCharacterService.getAllWorldCharacters().then((characters) => {
      this.characterList = characters;
      this.updateRelationshipUI();
    });

    this.worldStoryService.getAllWorldStories().then((stories) => {
      this.storyList = stories;
    });
  }

  private updateRelationshipUI() {
    if (this.characterList.length > 0 && this.worldCharacter) {
      for (let character of this.characterList) {
        if (this.getRelationship(character.id)?.hasRelationship == true) {
          let element = document.getElementById(`relationship-description-${character.id}`) as HTMLElement;
          console.log(element);
          // element.classList.remove('hidden');
          // console.log(`Relationship between ${this.worldCharacter?.firstName} and ${character.firstName}:`, this.getRelationship(character.id));
        }
      }
    }
  }

  toggleRelationship(event: Event, characterId: number) {
    console.log(`Toggling relationship for character ID: ${characterId}`);
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      console.log(`Checkbox is now: ${isChecked}`);
      let relationshipDescription = document.getElementById(`relationship-description-${characterId}`) as HTMLTextAreaElement;
      let relationshipType = document.getElementById(`relationship-type-${characterId}`) as HTMLInputElement;
      if (isChecked) {
        relationshipDescription.classList.remove('hidden');
        relationshipType.classList.remove('hidden');
    }
    else {
        relationshipDescription.classList.add('hidden');
        relationshipType.classList.add('hidden');
      }
    }
  }

  getRelationship(characterID: number): worldCharacterRelationship | undefined {
    return this.worldCharacter?.relationships?.find(r => r.relatedCharacterID === characterID.toString());
  }

  isStoryInCharacter(storyTitle: string): boolean {
    return this.worldCharacter?.stories?.includes(storyTitle) || false;
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
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      const characterName = `${this.worldCharacter?.firstName} ${this.worldCharacter?.lastName}`;
      
      this.worldStoryService.getWorldStoryById(storyId).then((story) => {
        if (story) {
          console.log(`Story ${story.title} ${isChecked ? 'added to' : 'removed from'} character`);
          
          // Update the story's characters list
          let updatedCharacters = story.characters || [];
          
          if (isChecked) {
            // Add character if not already present
            if (!updatedCharacters.includes(characterName)) {
              updatedCharacters.push(characterName);
            }
          } else {
            // Remove character if present
            updatedCharacters = updatedCharacters.filter(char => char !== characterName);
          }
          
          // Update the story with the new characters list
          this.worldStoryService.updateWorldStory(
            story.id,
            story.title,
            story.description,
            updatedCharacters,
            story.locations || [],
            story.tags || []
          );
        }
      });
    }
  }

  getFormStories(): string[] {
    const stories: string[] = [];
    for (let story of this.storyList) {
      const checkbox = document.getElementById(`story-checkbox-${story.id}`) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        stories.push(story.title);
      }
    }
    return stories;
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
    
    const selectedStories = this.getFormStories();
    const characterName = `${this.worldCharacter?.firstName} ${this.worldCharacter?.lastName}`;
    
    if (this.worldCharacter?.id !== undefined) {
      this.worldCharacterService.updateWorldCharacter(
        this.worldCharacter.id,
        this.applyForm.value.characterFirstName ?? '',
        this.applyForm.value.characterLastName ?? '',
        this.applyForm.value.characterAltNames?.split(', ') ?? [],
        this.applyForm.value.characterBirthdate ?? '',
        this.applyForm.value.characterPronouns ?? '',
        this.applyForm.value.characterRoles?.split(', ') ?? [],
        this.applyForm.value.characterAffiliations?.split(', ') ?? [],
        relationships,
        this.applyForm.value.characterPhysicalDescription ?? '',
        this.applyForm.value.characterNonPhysicalDescription ?? '',
        selectedStories,
        this.applyForm.value.characterTags?.split(', ') ?? [],
      );
      
      // Ensure all story records are updated to reflect their association with this character
      for (let story of this.storyList) {
        const isSelected = selectedStories.includes(story.title);
        
        this.worldStoryService.getWorldStoryById(story.id).then((fullStory) => {
          if (fullStory) {
            let updatedCharacters = fullStory.characters || [];
            const hasCharacter = updatedCharacters.includes(characterName);
            
            if (isSelected && !hasCharacter) {
              // Add character if selected but not in story's list
              updatedCharacters.push(characterName);
              this.updateStoryCharacters(story, fullStory, updatedCharacters);
            } else if (!isSelected && hasCharacter) {
              // Remove character if not selected but in story's list
              updatedCharacters = updatedCharacters.filter(char => char !== characterName);
              this.updateStoryCharacters(story, fullStory, updatedCharacters);
            }
          }
        });
      }
    }
  }
  
  private updateStoryCharacters(story: WorldStoryInfo, fullStory: WorldStoryInfo, updatedCharacters: string[]) {
    this.worldStoryService.updateWorldStory(
      story.id,
      fullStory.title,
      fullStory.description,
      updatedCharacters,
      fullStory.locations || [],
      fullStory.tags || []
    );
  }
}
