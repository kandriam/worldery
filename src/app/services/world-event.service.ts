import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface WorldEventInfo {
  id: string;
  name: string;
  description: string;
  date: string;
  end_date?: string;

  locations: string[];
  characters: string[];
  stories: string[];
  tags: string[];
  world?: string;
  isGhost?: boolean;
}

export function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Generate virtual birthday-anniversary events for the given characters.
 *  Each ghost event appears every year from age 1 up to the character's death
 *  OR the date of the last real event in the world, whichever comes first. */
export function generateBirthdayGhosts(
  characters: { id: string; personal_name: string; family_name: string; birthdate?: string; deathdate?: string; world?: string }[],
  realEvents: WorldEventInfo[]
): WorldEventInfo[] {
  const realDates = realEvents
    .filter(e => e.date && !e.isGhost)
    .map(e => new Date(e.date + 'T00:00:00'))
    .filter(d => !isNaN(d.getTime()));
  const lastRealDate = realDates.length > 0
    ? new Date(Math.max(...realDates.map(d => d.getTime())))
    : null;

  const ghosts: WorldEventInfo[] = [];

  for (const char of characters) {
    if (!char.birthdate) continue;
    const birth = new Date(char.birthdate + 'T00:00:00');
    if (isNaN(birth.getTime())) continue;

    const capDate = char.deathdate
      ? new Date(char.deathdate + 'T00:00:00')
      : lastRealDate;
    if (!capDate) continue;

    const name = `${char.personal_name} ${char.family_name}`.trim();
    const mm = String(birth.getMonth() + 1).padStart(2, '0');
    const dd = String(birth.getDate()).padStart(2, '0');

    for (let age = 1; ; age++) {
      const year = birth.getFullYear() + age;
      const ghostDate = new Date(year, birth.getMonth(), birth.getDate());
      if (ghostDate > capDate) break;
      ghosts.push({
        id: `ghost-birthday-${char.id}-${year}`,
        name: `${name}'s ${ordinalSuffix(age)} Birthday`,
        description: '',
        date: `${year}-${mm}-${dd}`,
        locations: [],
        characters: [String(char.id)],
        stories: [],
        tags: ['birthday'],
        world: char.world != null ? String(char.world) : undefined,
        isGhost: true,
      });
    }
  }

  return ghosts;
}

@Injectable({
  providedIn: 'root',
})
export class WorldEventService {
  // url = 'http://localhost:3000/worldevents';
  url = 'http://localhost:8000/api/events';
  
  constructor(private http: HttpClient, private router: Router) {}

  async getAllWorldEvents(worldId?: string): Promise<WorldEventInfo[]> {
    const url = worldId ? `${this.url}/?world=${worldId}` : `${this.url}/`;
    try {
      const data = await this.http.get<WorldEventInfo[]>(url).toPromise();
      console.log('[EventService] getAllWorldEvents url:', url, '→ count:', data?.length ?? 0, 'data:', data);
      return data ?? [];
    } catch (e: any) {
      console.error('[EventService] getAllWorldEvents FAILED:', url, e?.status, e?.message, e);
      return [];
    }
  }

  async getWorldEventById(id: string): Promise<WorldEventInfo | undefined> {
    try {
      const data = await this.http.get<WorldEventInfo>(`${this.url}/${id}/`).toPromise();
      return data ?? undefined;
    } catch (e) {
      console.error('Failed to fetch event by id:', id);
      return undefined;
    }
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
    // Map property names to Django model
    const payload = {
      name: eventTitle,
      date: eventDate,
      end_date: eventEndDate || undefined,
      description: eventDescription,
      locations: eventLocation,
      characters: eventCharacters,
      stories: eventStories,
      tags: eventTags,
      // relationships: characterRelationships // Only if your serializer supports it
    };
    return this.http.put(`${this.url}/${eventID}/`, payload)
      .pipe(catchError(error => {
        console.error('Error updating event:', error);
        throw error;
      }
    )).toPromise().then((updatedEvent: any) => {
      console.log('Event updated successfully', updatedEvent);
      return updatedEvent;
    });
    // fetch(`${this.url}/${eventID}/`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     id: eventID,
    //     name: eventTitle,
    //     date: eventDate,
    //     end_date: eventEndDate || undefined,
    //     description: eventDescription,
    //     location: eventLocation,
    //     characters: eventCharacters,
    //     stories: eventStories,
    //     tags: eventTags,
    //   }),
    // });
    // window.location.reload();
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
        // this.router.navigate(['/events']);
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        alert('Failed to delete event: ' + error.message);
      }
    });
  }
}