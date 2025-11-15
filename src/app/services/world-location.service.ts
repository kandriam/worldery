import { Injectable } from '@angular/core';
import { WorldLocationInfo } from '../worldlocation';

@Injectable({
  providedIn: 'root'
})
export class WorldLocationService {
  url = 'http://localhost:3000/worldlocations';

  async getAllWorldLocations(): Promise<WorldLocationInfo[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getWorldLocationById(id: number): Promise<WorldLocationInfo | undefined> {
    const data = await fetch(`${this.url}?id=${id}`);
    const locationJson = await data.json();
    return locationJson[0] ?? {};
  }

  updateWorldLocation(locationID: number, locationName: string, locationDescription: string, locationCharacters: string[], locationStories: string[], locationTags: string[]) {
    console.log(
      `Location edited:
      locationID: ${locationID},
      locationName: ${locationName},
      locationDescription: ${locationDescription},
      locationCharacters: ${locationCharacters},
      locationStories: ${locationStories},
      locationTags: ${locationTags}.`,
    );
    fetch(`${this.url}/${locationID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: locationID,
        name: locationName,
        description: locationDescription,
        characters: locationCharacters,
        stories: locationStories,
        tags: locationTags,
      }),
    });
  }

  createWorldLocation(locationName: string, locationDescription: string, locationCharacters: string[], locationStories: string[], locationTags: string[]) {
    console.log(
      `Location created:
      locationName: ${locationName},
      locationDescription: ${locationDescription},
      locationCharacters: ${locationCharacters},
      locationStories: ${locationStories},
      locationTags: ${locationTags}.`,
    );

    this.getAllWorldLocations().then(locations => {
      console.log(locations.length);
      // determine next id
      const maxId = locations.length > 0 ? Math.max(...locations.map(e => e.id)) : 0;
      const newId = String(maxId + 1);
      fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: newId,
          name: locationName,
          description: locationDescription,
          characters: locationCharacters,
          stories: locationStories,
          tags: locationTags,
        }),
      });
      window.location.reload();
    });
  }

  deleteWorldLocation(locationID: number) {
    console.log(`Deleting location with ID: ${locationID}`);
    fetch(`${this.url}/${locationID}`, {
      method: 'DELETE',
    });
    window.location.reload();
  }
}
