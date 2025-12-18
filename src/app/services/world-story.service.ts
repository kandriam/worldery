import { Injectable } from '@angular/core';
import { WorldStoryInfo } from '../worldstory';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WorldStoryService {
  url = 'http://localhost:3000/worldstories';
  
  constructor(private router: Router) {}

  async getAllWorldStories(): Promise<WorldStoryInfo[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getWorldStoryById(id: string): Promise<WorldStoryInfo | undefined> {
    const data = await fetch(`${this.url}?id=${id}`);
    const locationJson = await data.json();
    return locationJson[0] ?? {};
  }

  async updateWorldStory(storyID: string, storyTitle: string, storyDescription: string, storyCharacters: string[], storyLocations: string[], storyTags: string[], substories: string[] = []) {
    console.log(
      `Story edited:
      storyID: ${storyID},
      storyTitle: ${storyTitle},
      storyDescription: ${storyDescription},
      storyCharacters: ${storyCharacters},
      storyLocations: ${storyLocations},
      storyTags: ${storyTags}.`,
    );
    
    try {
      // Get current story to track changes
      const currentStory = await this.getWorldStoryById(storyID);
      const oldTitle = currentStory?.title || '';
      const oldCharacters = currentStory?.characters || [];
      const oldLocations = currentStory?.locations || [];
      
      const response = await fetch(`${this.url}/${storyID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: storyID,
          title: storyTitle,
          description: storyDescription,
          characters: storyCharacters,
          locations: storyLocations,
          tags: storyTags,
          substories: substories,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update story: ${response.statusText}`);
      }
      
      // Handle title changes in character and location references
      if (oldTitle !== storyTitle) {
        await this.updateStoryNameReferences(oldTitle, storyTitle);
      }
      
      // Update character relationships
      await this.updateCharacterStoryRelationships(storyTitle, oldCharacters, storyCharacters);
      
      // Update location relationships
      await this.updateLocationStoryRelationships(storyTitle, oldLocations, storyLocations);
      
      console.log('Story updated successfully with bidirectional relationships');
      return await response.json();
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  }

  async createWorldStory(
    storyTitle: string,
    storyDescription: string,
    storyCharacters: string[],
    storyLocations: string[],
    storyTags: string[],
    substories: string[] = [],
    goToPage: boolean = true
  ) : Promise<WorldStoryInfo> {
    console.log(
      `Story created:
      storyTitle: ${storyTitle},
      storyDescription: ${storyDescription},
      storyCharacters: ${storyCharacters},
      storyLocations: ${storyLocations},
      storyTags: ${storyTags}.`,
    );

    try {
      const stories = await this.getAllWorldStories();
      console.log('Current stories count:', stories.length);
      
      // determine next id as string
      const maxId = stories.length > 0 ? Math.max(...stories.map(e => parseInt(e.id.toString()))) : 0;
      const newId = (maxId + 1).toString();
      
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: newId,
          title: storyTitle,
          description: storyDescription,
          characters: storyCharacters,
          locations: storyLocations,
          tags: storyTags,
          substories: substories,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create story: ${response.statusText}`);
      }
      
      // Add bidirectional relationships for new story
      await this.updateCharacterStoryRelationships(storyTitle, [], storyCharacters);
      await this.updateLocationStoryRelationships(storyTitle, [], storyLocations);
      
      console.log('Story created successfully with bidirectional relationships');
      const newStory = await response.json();
      
      if (goToPage) {
        this.router.navigate([`/story/${newStory.id}`]);
      } else {
        window.location.reload();
      }
      return newStory;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async deleteWorldStory(storyID: string) {
    console.log(`Deleting story with ID: ${storyID}`);
    try {
      // Get story being deleted to clean up relationships
      const storyToDelete = await this.getWorldStoryById(storyID);
      if (!storyToDelete) {
        throw new Error('Story not found');
      }
      
      // Remove story from all character and location references
      await this.removeStoryFromAllRelationships(storyToDelete.title);
      
      const response = await fetch(`${this.url}/${storyID}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete story: ${response.statusText}`);
      }
      
      console.log('Story deleted successfully with relationship cleanup');
      this.router.navigate(['/stories']);
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  private async updateStoryNameReferences(oldTitle: string, newTitle: string) {
    try {
      // Update character references
      const charactersResponse = await fetch('http://localhost:3000/worldcharacters');
      const characters = await charactersResponse.json();
      
      for (const character of characters) {
        if (character.stories && character.stories.includes(oldTitle)) {
          const updatedStories = character.stories.map((story: string) => 
            story === oldTitle ? newTitle : story
          );
          await this.updateCharacterStories(character.id, character, updatedStories);
        }
      }
      
      // Update location references
      const locationsResponse = await fetch('http://localhost:3000/worldlocations');
      const locations = await locationsResponse.json();
      
      for (const location of locations) {
        if (location.stories && location.stories.includes(oldTitle)) {
          const updatedStories = location.stories.map((story: string) => 
            story === oldTitle ? newTitle : story
          );
          await this.updateLocationStories(location.id, location, updatedStories);
        }
      }
    } catch (error) {
      console.error('Error updating story name references:', error);
    }
  }

  private async updateCharacterStoryRelationships(storyTitle: string, oldCharacters: string[], newCharacters: string[]) {
    try {
      const charactersResponse = await fetch('http://localhost:3000/worldcharacters');
      const allCharacters = await charactersResponse.json();
      
      // Characters removed from story
      const removedCharacters = oldCharacters.filter(name => !newCharacters.includes(name));
      for (const characterName of removedCharacters) {
        const character = allCharacters.find((c: any) => 
          `${c.firstName} ${c.lastName}` === characterName
        );
        if (character && character.stories && character.stories.includes(storyTitle)) {
          const updatedStories = character.stories.filter((story: string) => story !== storyTitle);
          await this.updateCharacterStories(character.id, character, updatedStories);
        }
      }
      
      // Characters added to story
      const addedCharacters = newCharacters.filter(name => !oldCharacters.includes(name));
      for (const characterName of addedCharacters) {
        const character = allCharacters.find((c: any) => 
          `${c.firstName} ${c.lastName}` === characterName
        );
        if (character && (!character.stories || !character.stories.includes(storyTitle))) {
          const currentStories = character.stories || [];
          const updatedStories = [...currentStories, storyTitle];
          await this.updateCharacterStories(character.id, character, updatedStories);
        }
      }
    } catch (error) {
      console.error('Error updating character story relationships:', error);
    }
  }

  private async updateLocationStoryRelationships(storyTitle: string, oldLocations: string[], newLocations: string[]) {
    try {
      const locationsResponse = await fetch('http://localhost:3000/worldlocations');
      const allLocations = await locationsResponse.json();
      
      // Locations removed from story
      const removedLocations = oldLocations.filter(name => !newLocations.includes(name));
      for (const locationName of removedLocations) {
        const location = allLocations.find((l: any) => l.name === locationName);
        if (location && location.stories && location.stories.includes(storyTitle)) {
          const updatedStories = location.stories.filter((story: string) => story !== storyTitle);
          await this.updateLocationStories(location.id, location, updatedStories);
        }
      }
      
      // Locations added to story
      const addedLocations = newLocations.filter(name => !oldLocations.includes(name));
      for (const locationName of addedLocations) {
        const location = allLocations.find((l: any) => l.name === locationName);
        if (location && (!location.stories || !location.stories.includes(storyTitle))) {
          const currentStories = location.stories || [];
          const updatedStories = [...currentStories, storyTitle];
          await this.updateLocationStories(location.id, location, updatedStories);
        }
      }
    } catch (error) {
      console.error('Error updating location story relationships:', error);
    }
  }

  private async removeStoryFromAllRelationships(storyTitle: string) {
    try {
      // Remove from characters
      const charactersResponse = await fetch('http://localhost:3000/worldcharacters');
      const characters = await charactersResponse.json();
      
      for (const character of characters) {
        if (character.stories && character.stories.includes(storyTitle)) {
          const updatedStories = character.stories.filter((story: string) => story !== storyTitle);
          await this.updateCharacterStories(character.id, character, updatedStories);
        }
      }
      
      // Remove from locations
      const locationsResponse = await fetch('http://localhost:3000/worldlocations');
      const locations = await locationsResponse.json();
      
      for (const location of locations) {
        if (location.stories && location.stories.includes(storyTitle)) {
          const updatedStories = location.stories.filter((story: string) => story !== storyTitle);
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
