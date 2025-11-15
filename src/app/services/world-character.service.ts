import {Injectable} from '@angular/core';
import {WorldCharacterInfo} from '../worldcharacter';
@Injectable({
  providedIn: 'root',
})
export class WorldCharacterService {
  url = 'http://localhost:3000/worldcharacters';

  async getAllWorldCharacters(): Promise<WorldCharacterInfo[]> {
    const data = await fetch(this.url)
    return await data.json() ?? [];
  }

  async getWorldCharacterById(id: number): Promise<WorldCharacterInfo | undefined> {
      const data = await fetch(`${this.url}?id=${id}`);
      const characterJson = await data.json();
      return characterJson[0] ?? {};
    }

  updateWorldCharacter(characterID: number, characterFirstName: string, characterLastName: string, characterAltNames: string[], characterBirthdate: string, characterPronouns: string, characterRoles: string[], characterAffiliations: string[], characterRelationships: string[], characterPhysicalDescription: string, characterNonPhysicalDescription: string, characterStories: string[], characterTags: string[]) {
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
    fetch(`${this.url}/${characterID}`, {
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
  }

  createWorldCharacter(characterFirstName: string, characterLastName: string, characterAltNames: string[], characterBirthdate: string, characterPronouns: string, characterRoles: string[], characterAffiliations: string[], characterRelationships: string[], characterPhysicalDescription: string, characterNonPhysicalDescription: string, characterStories: string[], characterTags: string[]) {
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
    this.getAllWorldCharacters().then(characters => {
      console.log(characters.length);
      // determine next id
      const maxId = characters.length > 0 ? Math.max(...characters.map(e => e.id)) : 0;
      const newId = String(maxId + 1);
      fetch(this.url, {
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
      window.location.reload();
    });
  }

  deleteWorldCharacter(characterID: number) {
    console.log(`Deleting character with ID: ${characterID}`);
    fetch(`${this.url}/${characterID}`, {
      method: 'DELETE',
    });
    window.location.reload();
  }
}
