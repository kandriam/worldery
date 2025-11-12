import {Injectable} from '@angular/core';
import {WorldEventInfo} from './worldevent';
@Injectable({
  providedIn: 'root',
})
export class WorldEventService {
  url = 'http://localhost:3000/worldevents';

  async getAllWorldEvents(): Promise<WorldEventInfo[]> {
    const data = await fetch(this.url)
    return await data.json() ?? [];
  }

  async getWorldEventById(id: number): Promise<WorldEventInfo | undefined> {
      const data = await fetch(`${this.url}?id=${id}`);
      const locationJson = await data.json();
      return locationJson[0] ?? {};
    }

  submitApplication(eventTitle: string, eventDate: string, eventDescription: string, eventLocation: string, eventCharacters: string, eventStories: string, eventTags: string[]) {
    console.log(
      `Event edited:
      eventTitle: ${eventTitle},
      eventDate: ${eventDate},
      eventDescription: ${eventDescription},
      eventLocation: ${eventLocation},
      eventCharacters: ${eventCharacters},
      eventStories: ${eventStories},
      eventTags: ${eventTags}.`,
    );
  }
}
