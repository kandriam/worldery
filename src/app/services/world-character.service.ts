import {Injectable} from '@angular/core';
import { Router } from '@angular/router'; 
import {WorldCharacterInfo, worldCharacterRelationship } from '../worldcharacter';
@Injectable({
  providedIn: 'root',
})
export class WorldCharacterService {
  url = 'http://localhost:3000/worldcharacters';
  
  constructor(private router: Router) {}

  async getAllWorldCharacters(): Promise<WorldCharacterInfo[]> {
    const data = await fetch(this.url)
    return await data.json() ?? [];
  }

  async getWorldCharacterById(id: string): Promise<WorldCharacterInfo | undefined> {
    const data = await fetch(`${this.url}?id=${id}`);
    const characterJson = await data.json();
    return characterJson[0] ?? {};
  }

  async getWorldCharactersByName(firstName: string, lastName: string): Promise<WorldCharacterInfo[]> {
    const data = await fetch(`${this.url}?firstName=${firstName}&lastName=${lastName}`);
    return await data.json() ?? [];
  }

  async updateWorldCharacter(
    characterID: string,
    characterFirstName: string,
    characterLastName: string,
    characterAltNames: string[],
    characterBirthdate: string,
    characterBirthEventId: string,
    characterDeathdate: string,
    characterDeathEventId: string,
    characterPronouns: string,
    characterRoles: string[],
    characterAffiliations: string[],
    characterRelationships: worldCharacterRelationship[],
    characterPhysicalDescription: string,
    characterNonPhysicalDescription: string,
    characterStories: string[],
    characterTags: string[]) {
    console.log(
      `Character edited:
      characterID: ${characterID},
      characterFirstName: ${characterFirstName},
      characterLastName: ${characterLastName},
      characterAltNames: ${characterAltNames},
      characterBirthdate: ${characterBirthdate},
      characterBirthEventId: ${characterBirthEventId},
      characterDeathdate: ${characterDeathdate},
      characterDeathEventId: ${characterDeathEventId},
      characterPronouns: ${characterPronouns},
      characterRoles: ${characterRoles},
      characterAffiliations: ${characterAffiliations},
      characterRelationships: ${characterRelationships},
      characterPhysicalDescription: ${characterPhysicalDescription},
      characterNonPhysicalDescription: ${characterNonPhysicalDescription},
      characterStories: ${characterStories},
      characterTags: ${characterTags}.`,
    );

    try {
      // Get current character to track changes
      const currentCharacter = await this.getWorldCharacterById(characterID);
      const oldStories = currentCharacter?.stories || [];

      // Update the main character
      const response = await fetch(`${this.url}/${characterID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: characterID,
          firstName: characterFirstName,
          lastName: characterLastName,
          altNames: characterAltNames,
          birthdate: characterBirthdate,
          birthEventId: characterBirthEventId,
          deathdate: characterDeathdate,
          deathEventId: characterDeathEventId,
          pronouns: characterPronouns,
          roles: characterRoles,
          affiliations: characterAffiliations,
          relationships: characterRelationships,
          physicalDescription: characterPhysicalDescription,
          nonPhysicalDescription: characterNonPhysicalDescription,
          stories: characterStories,
          tags: characterTags,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update character: ${response.statusText}`);
      }

      // --- Bidirectional update for stories ---
      for (const storyId of oldStories) {
        if (!characterStories.includes(storyId)) {
          await this.updateEntityArray('worldstories', storyId, 'characters', characterID, false);
        }
      }
      for (const storyId of characterStories) {
        if (!oldStories.includes(storyId)) {
          await this.updateEntityArray('worldstories', storyId, 'characters', characterID, true);
        }
      }



      console.log('Character updated successfully with bidirectional relationships');
      return await response.json();
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  /**
   * Helper to add or remove an ID from an array field in another entity
   */
  private async updateEntityArray(entityType: string, entityId: string, arrayField: string, value: string, add: boolean) {
    const url = `http://localhost:3000/${entityType}/${entityId}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const entity = await res.json();
    if (!entity) return;
    let arr = entity[arrayField] || [];
    if (add) {
      if (!arr.includes(value)) arr.push(value);
    } else {
      arr = arr.filter((v: string) => v !== value);
    }
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entity, [arrayField]: arr })
    });
  }

  async createWorldCharacter(
    characterFirstName: string,
    characterLastName:string,
    characterAltNames: string[],
    characterBirthdate: string,
    characterBirthEventId: string,
    characterDeathdate: string,
    characterDeathEventId: string,
    characterPronouns: string,
    characterRoles: string[],
    characterAffiliations: string[],
    characterRelationships: worldCharacterRelationship[],
    characterPhysicalDescription: string,
    characterNonPhysicalDescription: string,
    characterStories: string[],
    characterTags: string[],
    goToPage: boolean = true
  ) : Promise<WorldCharacterInfo> {
    console.log(
      `Character created:
      characterFirstName: ${characterFirstName},
      characterLastName: ${characterLastName},
      characterAltNames: ${characterAltNames},
      characterBirthdate: ${characterBirthdate},
      characterDeathdate: ${characterDeathdate},
      characterPronouns: ${characterPronouns},
      characterRoles: ${characterRoles},
      characterAffiliations: ${characterAffiliations},
      characterRelationships: ${characterRelationships},
      characterPhysicalDescription: ${characterPhysicalDescription},
      characterNonPhysicalDescription: ${characterNonPhysicalDescription},
      characterStories: ${characterStories},
      characterTags: ${characterTags}.`,
    );
    
    try {
      const characters = await this.getAllWorldCharacters();
      console.log('Current characters count:', characters.length);
      
      // determine next id - convert to numbers for comparison, then back to string
      const maxId = characters.length > 0 ? Math.max(...characters.map(e => parseInt(e.id))) : 0;
      const newId = (maxId + 1).toString();
      
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: newId,
          firstName: characterFirstName,
          lastName: characterLastName,
          altNames: characterAltNames,
          birthdate: characterBirthdate,
          birthEventId: characterBirthEventId,
          deathdate: characterDeathdate,
          deathEventId: characterDeathEventId,
          pronouns: characterPronouns,
          roles: characterRoles,
          affiliations: characterAffiliations,
          relationships: characterRelationships,
          physicalDescription: characterPhysicalDescription,
          nonPhysicalDescription: characterNonPhysicalDescription,
          stories: characterStories,
          tags: characterTags,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create character: ${response.statusText}`);
      }
      
      console.log('Character created successfully');
      const newCharacter = await response.json();
      if (goToPage) {
        this.router.navigate([`/character/${newCharacter.id}`]);
      } else {
        window.location.reload();
      }
      return newCharacter;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  async deleteWorldCharacter(characterID: string) {
    console.log(`Deleting character with ID: ${characterID}`);
    try {
      const response = await fetch(`${this.url}/${characterID}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete character: ${response.statusText}`);
      }
      
      console.log('Character deleted successfully');
      this.router.navigate(['/characters']);
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  }
  
  updateCharacterRelationships(characterID: string, relatedCharacterName: string, relationships: worldCharacterRelationship[]) {
    console.log(`Updating relationships for character ID: ${characterID} with relationships: ${JSON.stringify(relationships)}`);
    fetch(`${this.url}/${characterID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        relationships: relationships,
      }),
    });
  }
}