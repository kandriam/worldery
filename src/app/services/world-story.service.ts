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

  createWorldStory(storyTitle: string, storyDescription: string, storyCharacters: string[], storyLocations: string[], storyTags: string[]) {
    console.log(
      `Story created:
      storyTitle: ${storyTitle},
      storyDescription: ${storyDescription},
      storyCharacters: ${storyCharacters},
      storyLocations: ${storyLocations},
      storyTags: ${storyTags}.`,
    );

    this.getAllWorldStories().then(stories => {
      console.log(stories.length);
      // determine next id
      const maxId = stories.length > 0 ? Math.max(...stories.map(e => e.id)) : 0;
      const newId = String(maxId + 1);
      fetch(this.url, {
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
        }),
      });
      window.location.reload();
    });
  }

  deleteWorldStory(storyID: number) {
    console.log(`Story deleted: storyID: ${storyID}.`);
    fetch(`${this.url}/${storyID}`, {
      method: 'DELETE',
    });
    window.location.reload();
  }
}
