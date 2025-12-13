import {Injectable} from '@angular/core';
import { Router } from '@angular/router';
import {WorldEventInfo} from '../worldevent';
@Injectable({
  providedIn: 'root',
})
export class WorldEventService {
  url = 'http://localhost:3000/worldevents';
  
  constructor(private router: Router) {}

  async getAllWorldEvents(): Promise<WorldEventInfo[]> {
    const data = await fetch(this.url)
    return await data.json() ?? [];
  }

  async getWorldEventById(id: string): Promise<WorldEventInfo | undefined> {
      const data = await fetch(`${this.url}?id=${id}`);
      const locationJson = await data.json();
      return locationJson[0] ?? {};
    }

  updateWorldEvent(eventID: string, eventTitle: string, eventDate: string, eventEndDate: string, eventDescription: string, eventLocation: string[], eventCharacters: string[], eventStories: string[], eventTags: string[]) {
    console.log(
      `Event edited:
      eventID: ${eventID},
      eventTitle: ${eventTitle},
      eventDate: ${eventDate},
      eventEndDate: ${eventEndDate},
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
        endDate: eventEndDate || undefined,
        description: eventDescription,
        location: eventLocation,
        characters: eventCharacters,
        stories: eventStories,
        tags: eventTags,
      }),
    });
  }

  async createWorldEvent(
    eventTitle: string,
    eventDate: string,
    eventEndDate: string,
    eventDescription: string,
    eventLocation: string[],
    eventCharacters: string[],
    eventStories: string[],
    eventTags: string[],
    goToPage: boolean = true
  ): Promise<void> {  
    console.log(
      `Event created:
      eventTitle: ${eventTitle},
      eventDate: ${eventDate},
      eventEndDate: ${eventEndDate},
      eventDescription: ${eventDescription},
      eventLocation: ${eventLocation},
      eventCharacters: ${eventCharacters},
      eventStories: ${eventStories},
      eventTags: ${eventTags}.`,
    );

    const events = await this.getAllWorldEvents();
    const maxId = events.length > 0 ? Math.max(...events.map(e => parseInt(e.id.toString()))) : 0;
    const newId = (maxId + 1).toString();
    await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newId,
        name: eventTitle,
        date: eventDate,
        endDate: eventEndDate || undefined,
        description: eventDescription,
        location: eventLocation,
        characters: eventCharacters,
        stories: eventStories,
        tags: eventTags,
      }),
    });
    if (goToPage) {
      this.router.navigate([`/event/${newId}`]);
    } else {
      window.location.reload();
    }
  }

  deleteWorldEvent(eventID: string) {
    console.log(`Event deleted: eventID: ${eventID}.`);
    fetch(`${this.url}/${eventID}`, {
      method: 'DELETE',
    });
    this.router.navigate(['/events']);
  }
}
