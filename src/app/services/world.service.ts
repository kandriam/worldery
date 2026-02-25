import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { WorldInfo } from '../world';
import { Observable, catchError, of } from 'rxjs';

export interface WorldInfo {
    id: string;
    title: string;
    timeSystem: string;
    description: string;
    genres: string[];
    // tags: string[];
    // characters: string[]; // Array of character IDs
    // locations: string[]; // Array of location IDs
    // events: string[]; // Array of event IDs
    // stories: string[]; // Array of story IDs
}

@Injectable({
    providedIn: 'root'
})


export class WorldInfoService {
    // private readonly API_URL = 'http://localhost:3000/worldinfo';
    private readonly API_URL = 'http://localhost:8000/api/worlds';

    constructor(private http: HttpClient) {}

    getWorlds(): Observable<WorldInfo[]> {
        return this.http.get<WorldInfo[]>(`${this.API_URL}/`)
            .pipe(catchError(error => {
                console.error('Error fetching worlds:', error);
                return of([]);
            }));
    }

    getWorld(id: string): Observable<WorldInfo | null> {
        return this.http.get<WorldInfo>(`${this.API_URL}/${id}/`)
            .pipe(catchError(error => {
                console.error('Error fetching world:', error);
                return of(null);
            }));
    }

    createWorld(world: WorldInfo): Observable<WorldInfo | null> {
        return this.http.post<WorldInfo>(this.API_URL, world)
            .pipe(catchError(error => {
                console.error('Error creating world:', error);
                return of(null);
            }));
    }

    /**
     * Updates a world by id. Sends the full WorldInfo object for maximum compatibility.
     * Ensure your backend PUT /worldinfo/:id expects the full object.
     */
    updateWorld(id: string, world: WorldInfo): Observable<WorldInfo | null> {
        return this.http.put<WorldInfo>(`${this.API_URL}/${id}/`, world)
            .pipe(catchError(error => {
                console.error('Error updating world:', error);
                return of(null);
            }));
    }

    deleteWorld(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}/`)
            .pipe(catchError(error => {
                console.error('Error deleting world:', error);
                return of(undefined);
            }));
    }
}