import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface TagInfo {
    id: string;
    name: string;
    // count: number; // Number of times this tag is used across characters, locations, events, and stories
}

@Injectable({
  providedIn: 'root',
})

export class TagService {
  url = 'http://localhost:8000/api/tags';

  constructor(private router: Router, private http: HttpClient) {}

  async getallTags(): Promise<TagInfo[]> {
    const data = await this.http.get<TagInfo[]>(this.url).toPromise();
    return data ?? [];
  }

  async getTagById(id: string): Promise<TagInfo | undefined> {
    // Use RESTful detail endpoint for correct tag
    const data = await fetch(`${this.url}/${id}/`);
    if (!data.ok) {
      console.error('Failed to fetch tag by id:', id);
      return undefined;
    }
    const tagJson = await data.json();
    return tagJson;
  }

  async getTagsByName(name: string): Promise<TagInfo[] | undefined> {
    const data = await fetch(`${this.url}?name=${encodeURIComponent(name)}`);
    if (!data.ok) {
      console.error('Failed to fetch tag by name:', name);
      return undefined;
    }
    const tagJson = await data.json();
    return tagJson;
  }
}