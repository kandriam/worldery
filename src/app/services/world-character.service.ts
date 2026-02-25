import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface WorldCharacterInfo {
    id: string;
    personal_name: string;
    family_name: string;
    alt_names: string[];
    physical_description: string;
    non_physical_description: string;

    pronouns: string;
    birthdate?: string;
    deathdate?: string;
    birth_event_id?: string; // Event ID for birth
    death_event_id?: string; // Event ID for death
    roles: string[];
    affiliations: string[];
    relationships: worldCharacterRelationship[];
    // events: string[];
    // locations: string[];
    stories: string[];
    tags: string[];
}

export interface worldCharacterRelationship {
    relatedCharacterID: string;
    hasRelationship: boolean;
    relationshipType: string[];
    relationshipDescription: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorldCharacterService {
  // url = 'http://localhost:3000/worldcharacters';
  url = 'http://localhost:8000/api/characters';
  
  constructor(private router: Router, private http: HttpClient) {}

  async getAllWorldCharacters(): Promise<WorldCharacterInfo[]> {
    const data = await this.http.get<WorldCharacterInfo[]>(this.url).toPromise();
    return data ?? [];
  }

  async getWorldCharacterById(id: string): Promise<WorldCharacterInfo | undefined> {
    // Use RESTful detail endpoint for correct character
    const data = await fetch(`${this.url}/${id}/`);
    if (!data.ok) {
      console.error('Failed to fetch character by id:', id);
      return undefined;
    }
    const characterJson = await data.json();
    return characterJson;
  }

  async getWorldCharactersByName(firstName: string, lastName: string): Promise<WorldCharacterInfo[]> {
    const data = await fetch(`${this.url}/?firstName=${firstName}&lastName=${lastName}/`);
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
    characterTags: string[]
  ){
    // Map property names to Django model
    const payload = {
      personal_name: characterFirstName,
      family_name: characterLastName,
      alt_names: characterAltNames,
      birthdate: characterBirthdate || null,
      deathdate: characterDeathdate || null,
      birth_event: characterBirthEventId || null,
      death_event: characterDeathEventId || null,
      pronouns: characterPronouns,
      roles: characterRoles,
      affiliations: characterAffiliations,
      physical_description: characterPhysicalDescription,
      non_physical_description: characterNonPhysicalDescription,
      stories: characterStories,
      tags: characterTags,
      // relationships: characterRelationships // Only if your serializer supports it
    };
    return this.http.put(`${this.url}/${characterID}/`, payload)
      .pipe(catchError(error => {
        console.error('Error updating character:', error);
        throw error;
      }
    )).toPromise().then((updatedChar: any) => {
      console.log('Character updated successfully', updatedChar);
      return updatedChar;
    });
  }

  /**
   * Helper to add or remove an ID from an array field in another entity
   */
  // private async updateEntityArray(entityType: string, entityId: string, arrayField: string, value: string, add: boolean) {
  //   const url = `http://localhost:8000/${entityType}/${entityId}`;
  //   const res = await fetch(url);
  //   if (!res.ok) return;
  //   const entity = await res.json();
  //   if (!entity) return;
  //   let arr = entity[arrayField] || [];
  //   if (add) {
  //     if (!arr.includes(value)) arr.push(value);
  //   } else {
  //     arr = arr.filter((v: string) => v !== value);
  //   }
  //   await fetch(url, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ ...entity, [arrayField]: arr })
  //   });
  // }

  createWorldCharacter(character: WorldCharacterInfo, goToPage: boolean): Observable<WorldCharacterInfo | null> {
    return this.http.post<WorldCharacterInfo>(`${this.url}/`, character)
        .pipe(catchError(error => {
            console.error('Error creating character:', error);
            return of(null);
        }));
  }

  async deleteWorldCharacter(characterID: string) {
    console.log(`Deleting character with ID: ${characterID}`);
    this.http.delete(`${this.url}/${characterID}/`).subscribe({
      next: () => {
        console.log('Character deleted successfully');
        this.router.navigate(['/characters']);
      },
      error: (error) => {
        console.error('Error deleting character:', error);
        alert('Failed to delete character: ' + error.message);
      }
    });
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