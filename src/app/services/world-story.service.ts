import { Injectable } from '@angular/core';
import { WorldStoryInfo } from '../worldstory';

@Injectable({
  providedIn: 'root'
})
export class WorldStoryService {
  url = 'http://localhost:3000/worldstories';

  async getAllWorldStories(): Promise<WorldStoryInfo[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getWorldStoryById(id: number): Promise<WorldStoryInfo | undefined> {
    const data = await fetch(`${this.url}?id=${id}`);
    const locationJson = await data.json();
    return locationJson[0] ?? {};
  }

  updateWorldStory(storyID: number, storyTitle: string, storyDescription: string, storyCharacters: string[], storyLocations: string[], storyTags: string[]) {
    console.log(
      `Story edited:
      storyID: ${storyID},
      storyTitle: ${storyTitle},
      storyDescription: ${storyDescription},
      storyTags: ${storyTags}.`,
    );
    fetch(`${this.url}/${storyID}`, {
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
      }),
    });
  }
}
