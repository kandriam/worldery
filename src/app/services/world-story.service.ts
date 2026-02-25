import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface WorldStoryInfo {
    id: string;
    title: string;
    description: string;
    characters: string[];
    locations: string[];
    substories: string[];
    parentStoryId?: string;
    genre: string[];
    tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WorldStoryService {
  // url = 'http://localhost:3000/worldstories';
  url = 'http://localhost:8000/api/stories';
  
  constructor(private http: HttpClient, private router: Router) {}

  async getAllWorldStories(): Promise<WorldStoryInfo[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getWorldStoryById(id: string): Promise<WorldStoryInfo | undefined> {
    // Use RESTful detail endpoint for correct story
    const data = await fetch(`${this.url}/${id}/`);
    if (!data.ok) {
      console.error('Failed to fetch story by id:', id);
      return undefined;
    }
    const storyJson = await data.json();
    return storyJson;
  }

  async updateWorldStory(
    storyID: string,
    storyTitle: string,
    storyDescription: string,
    storyCharacters: string[],
    storyLocations: string[],
    storyTags: string[],
    substories: string[] = []
  ) {
    // Map property names to Django model
    const payload = {
      title: storyTitle,
      description: storyDescription,
      characters: storyCharacters,
      locations: storyLocations,
      tags: storyTags,
      substories: substories
      // relationships: characterRelationships // Only if your serializer supports it
    };
    return this.http.put(`${this.url}/${storyID}/`, payload)
      .pipe(catchError(error => {
        console.error('Error updating story:', error);
        throw error;
      }
    )).toPromise().then((updatedStory: any) => {
      console.log('Character updated successfully', updatedStory);
      return updatedStory;
    });
  }

  createWorldStory(event: WorldStoryInfo, goToPage: boolean): Observable<WorldStoryInfo | null> {
    return this.http.post<WorldStoryInfo>(`${this.url}/`, event)
        .pipe(catchError(error => {
            console.error('Error creating story:', error);
            return of(null);
      }));
  }

  async deleteWorldStory(storyID: string) {
    console.log(`Deleting story with ID: ${storyID}`);
    this.http.delete(`${this.url}/${storyID}/`).subscribe({
      next: () => {
        console.log('Story deleted successfully');
        this.router.navigate(['/stories']);
      },
      error: (error) => {
        console.error('Error deleting story:', error);
        alert('Failed to delete story: ' + error.message);
      }
    });
  }


  // No longer needed: updateStoryNameReferences (IDs are immutable)

  private async updateCharacterStoryRelationships(storyID: string, oldCharacters: string[], newCharacters: string[]) {
    try {
      const charactersResponse = await fetch('http://localhost:3000/worldcharacters');
      const allCharacters = await charactersResponse.json();
      // Characters removed from story
      const removedCharacters = oldCharacters.filter(id => !newCharacters.includes(id));
      for (const characterId of removedCharacters) {
        const character = allCharacters.find((c: any) => c.id === characterId);
        if (character && character.stories && character.stories.includes(storyID)) {
          const updatedStories = character.stories.filter((sid: string) => sid !== storyID);
          await this.updateCharacterStories(character.id, character, updatedStories);
        }
      }
      // Characters added to story
      const addedCharacters = newCharacters.filter(id => !oldCharacters.includes(id));
      for (const characterId of addedCharacters) {
        const character = allCharacters.find((c: any) => c.id === characterId);
        if (character && (!character.stories || !character.stories.includes(storyID))) {
          const currentStories = character.stories || [];
          const updatedStories = [...currentStories, storyID];
          await this.updateCharacterStories(character.id, character, updatedStories);
        }
      }
    } catch (error) {
      console.error('Error updating character story relationships:', error);
    }
  }

  private async updateLocationStoryRelationships(storyID: string, oldLocations: string[], newLocations: string[]) {
    try {
      const locationsResponse = await fetch('http://localhost:3000/worldlocations');
      const allLocations = await locationsResponse.json();
      // Locations removed from story
      const removedLocations = oldLocations.filter(id => !newLocations.includes(id));
      for (const locationId of removedLocations) {
        const location = allLocations.find((l: any) => l.id === locationId);
        if (location && location.stories && location.stories.includes(storyID)) {
          const updatedStories = location.stories.filter((sid: string) => sid !== storyID);
          await this.updateLocationStories(location.id, location, updatedStories);
        }
      }
      // Locations added to story
      const addedLocations = newLocations.filter(id => !oldLocations.includes(id));
      for (const locationId of addedLocations) {
        const location = allLocations.find((l: any) => l.id === locationId);
        if (location && (!location.stories || !location.stories.includes(storyID))) {
          const currentStories = location.stories || [];
          const updatedStories = [...currentStories, storyID];
          await this.updateLocationStories(location.id, location, updatedStories);
        }
      }
    } catch (error) {
      console.error('Error updating location story relationships:', error);
    }
  }

  private async removeStoryFromAllRelationships(storyID: string) {
    try {
      // Remove from characters
      const charactersResponse = await fetch('http://localhost:3000/worldcharacters');
      const characters = await charactersResponse.json();
      for (const character of characters) {
        if (character.stories && character.stories.includes(storyID)) {
          const updatedStories = character.stories.filter((sid: string) => sid !== storyID);
          await this.updateCharacterStories(character.id, character, updatedStories);
        }
      }
      // Remove from locations
      const locationsResponse = await fetch('http://localhost:3000/worldlocations');
      const locations = await locationsResponse.json();
      for (const location of locations) {
        if (location.stories && location.stories.includes(storyID)) {
          const updatedStories = location.stories.filter((sid: string) => sid !== storyID);
          await this.updateLocationStories(location.id, location, updatedStories);
        }
      }
    } catch (error) {
      console.error('Error removing story from relationships:', error);
    }
  }

  private async updateCharacterStories(characterId: string, character: any, stories: string[]) {
    try {
      const response = await fetch(`http://localhost:3000/worldcharacters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...character,
          stories: stories,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update character stories: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating character stories:', error);
    }
  }

  private async updateLocationStories(locationId: string, location: any, stories: string[]) {
    try {
      const response = await fetch(`http://localhost:3000/worldlocations/${locationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...location,
          stories: stories,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update location stories: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating location stories:', error);
    }
  }
}
