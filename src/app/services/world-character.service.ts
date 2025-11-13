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

  updateWorldCharacter(characterID: number, characterName: string, characterAltNames: string[], characterBirthdate: string, characterPronouns: string, characterRoles: string[], characterAffiliations: string[], characterRelationships: string[], characterDescription: string, characterStories: string[], characterTags: string[]) {
    console.log(
      `Character edited:
      characterID: ${characterID},
      characterName: ${characterName},
      characterAltNames: ${characterAltNames},
      characterBirthdate: ${characterBirthdate},
      characterPronouns: ${characterPronouns},
      characterRoles: ${characterRoles},
      characterAffiliations: ${characterAffiliations},
      characterRelationships: ${characterRelationships},
      characterDescription: ${characterDescription},
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
        name: characterName,
        altNames: characterAltNames,
        birthdate: characterBirthdate,
        pronouns: characterPronouns,
        roles: characterRoles,
        affiliations: characterAffiliations,
        relationships: characterRelationships,
        description: characterDescription,
        stories: characterStories,
        tags: characterTags,
      }),
    });
  }
}
