import {Injectable} from '@angular/core';
import {WorldEventInfo} from '../worldevent';
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

  updateWorldEvent(eventID: number, eventTitle: string, eventDate: string, eventDescription: string, eventLocation: string, eventCharacters: string, eventStories: string, eventTags: string[]) {
    console.log(
      `Event edited:
      eventID: ${eventID},
      eventTitle: ${eventTitle},
      eventDate: ${eventDate},
      eventDescription: ${eventDescription},
      eventLocation: ${eventLocation},
      eventCharacters: ${eventCharacters},
      eventStories: ${eventStories},
      eventTags: ${eventTags}.`,
    );
    fetch(`${this.url}/${eventID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: eventID,
        name: eventTitle,
        date: eventDate,
        description: eventDescription,
        location: eventLocation.split(', '),
        characters: eventCharacters.split(', '),
        stories: eventStories.split(', '),
        tags: eventTags,
      }),
    });
  }

  createWorldEvent(eventTitle: string, eventDate: string, eventDescription: string, eventLocation: string, eventCharacters: string, eventStories: string, eventTags: string[]) {
    console.log(
      `Event created:
      eventTitle: ${eventTitle},
      eventDate: ${eventDate},
      eventDescription: ${eventDescription},
      eventLocation: ${eventLocation},
      eventCharacters: ${eventCharacters},
      eventStories: ${eventStories},
      eventTags: ${eventTags}.`,
    );

    this.getAllWorldEvents().then(events => {
      console.log(events.length);
      // determine next id
      const maxId = events.length > 0 ? Math.max(...events.map(e => e.id)) : 0;
      const newId = String(maxId + 1);
      fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: newId,
          name: eventTitle,
          date: eventDate,
          description: eventDescription,
          location: eventLocation.split(', '),
          characters: eventCharacters.split(', '),
          stories: eventStories.split(', '),
          tags: eventTags,
        }),
      });
      window.location.reload();
    });
  }

  deleteWorldEvent(eventID: number) {
    console.log(`Event deleted: eventID: ${eventID}.`);
    fetch(`${this.url}/${eventID}`, {
      method: 'DELETE',
    });
    window.location.reload();
  }
}
