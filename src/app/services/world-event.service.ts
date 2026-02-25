import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface WorldEventInfo {
  id: string;
  name: string;
  description: string;
  date: string;
  endDate?: string;

  location: string[];
  characters: string[];
  stories: string[];
  tags: string[];
}

@Injectable({
  providedIn: 'root',
})
export class WorldEventService {
  // url = 'http://localhost:3000/worldevents';
  url = 'http://localhost:8000/api/events';
  
  constructor(private http: HttpClient, private router: Router) {}

  async getAllWorldEvents(): Promise<WorldEventInfo[]> {
    const data = await fetch(this.url)
    return await data.json() ?? [];
  }

  async getWorldEventById(id: string): Promise<WorldEventInfo | undefined> {
      const data = await fetch(`${this.url}/${id}`);
      const locationJson = await data.json();
      return locationJson[0] ?? {};
    }

  updateWorldEvent(
    eventID: string,
    eventTitle: string,
    eventDate: string,
    eventEndDate: string,
    eventDescription: string,
    eventLocation: string[],
    eventCharacters: string[],
    eventStories: string[],
    eventTags: string[]
  ) {
    fetch(`${this.url}/${eventID}/`, {
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
    window.location.reload();
  }

  createWorldEvent(event: WorldEventInfo, goToPage: boolean): Observable<WorldEventInfo | null> {
    return this.http.post<WorldEventInfo>(`${this.url}/`, event)
        .pipe(catchError(error => {
            console.error('Error creating event:', error);
            return of(null);
      }));
  }

  async deleteWorldEvent(eventID: string) {
    console.log(`Deleting event with ID: ${eventID}`);
    this.http.delete(`${this.url}/${eventID}/`).subscribe({
      next: () => {
        console.log('Event deleted successfully');
        this.router.navigate(['/events']);
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        alert('Failed to delete event: ' + error.message);
      }
    });
  }
}