import {Injectable} from '@angular/core';
import {WorldCharacterInfo, worldCharacterRelationship } from '../worldcharacter';
@Injectable({
  providedIn: 'root',
})
export class WorldCharacterService {
  url = 'http://localhost:3000/worldcharacters';

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

  async updateWorldCharacter(characterID: string, characterFirstName: string, characterLastName: string, characterAltNames: string[], characterBirthdate: string, characterPronouns: string, characterRoles: string[], characterAffiliations: string[], characterRelationships: worldCharacterRelationship[], characterPhysicalDescription: string, characterNonPhysicalDescription: string, characterStories: string[], characterTags: string[]) {
    console.log(
      `Character edited:
      characterID: ${characterID},
      characterFirstName: ${characterFirstName},
      characterLastName: ${characterLastName},
      characterAltNames: ${characterAltNames},
      characterBirthdate: ${characterBirthdate},
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
      
      console.log('Character updated successfully');
      return await response.json();
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  async createWorldCharacter(characterFirstName: string, characterLastName: string, characterAltNames: string[], characterBirthdate: string, characterPronouns: string, characterRoles: string[], characterAffiliations: string[], characterRelationships: worldCharacterRelationship[], characterPhysicalDescription: string, characterNonPhysicalDescription: string, characterStories: string[], characterTags: string[]) {
    console.log(
      `Character created:
      characterFirstName: ${characterFirstName},
      characterLastName: ${characterLastName},
      characterAltNames: ${characterAltNames},
      characterBirthdate: ${characterBirthdate},
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
      window.location.reload();
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
      window.location.reload();
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