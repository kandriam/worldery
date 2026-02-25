import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface WorldLocationInfo {
    id: string;
    name: string;
    description: string;
    characters: string[];
    stories: string[];
    related_locations: string[];
    tags: string[];
}
@Injectable({
  providedIn: 'root'
})
export class WorldLocationService {
  // url = 'http://localhost:3000/worldlocations';
  url = 'http://localhost:8000/api/locations';
  
  constructor(private http: HttpClient, private router: Router) {}

  async getAllWorldLocations(): Promise<WorldLocationInfo[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getWorldLocationById(id: string): Promise<WorldLocationInfo | undefined> {
    // Use RESTful detail endpoint for correct location
    const data = await fetch(`${this.url}/${id}/`);
    if (!data.ok) {
      console.error('Failed to fetch location by id:', id);
      return undefined;
    }
    const locationJson = await data.json();
    return locationJson;
  }

  async updateWorldLocation(
    locationID: string,
    locationName: string,
    locationDescription: string,
    locationCharacters: string[],
    locationStories: string[],
    locationRelatedLocations: string[],
    locationTags: string[]
  ) {
    console.log(
      `Location edited:
      locationID: ${locationID},
      locationName: ${locationName},
      locationDescription: ${locationDescription},
      locationCharacters: ${locationCharacters},
      locationStories: ${locationStories},
      locationRelatedLocations: ${locationRelatedLocations},
      locationTags: ${locationTags}.`,
    );
    
    // Map property names to Django model
    const payload = {
      name: locationName,
      description: locationDescription,
      characters: locationCharacters,
      stories: locationStories,
      related_locations: locationRelatedLocations,
      tags: locationTags,
    };
    return this.http.put(`${this.url}/${locationID}/`, payload)
      .pipe(catchError(error => {
        console.error('Error updating location:', error);
        throw error;
      }
    )).toPromise().then((updatedLocation: any) => {
      console.log('Location updated successfully', updatedLocation);
      return updatedLocation;
    });
  }

  private async updateLocationNameReferences(oldName: string, newName: string) {
    try {
      const allLocations = await this.getAllWorldLocations();
      
      // Find all locations that reference the old name
      const locationsToUpdate = allLocations.filter(location => 
        location.related_locations.includes(oldName)
      );
      
      // Update each location to use the new name
      for (const location of locationsToUpdate) {
        const updatedRelatedLocations = location.related_locations.map(
          name => name === oldName ? newName : name
        );
        await this.updateLocationRelationshipsOnly(location.id, updatedRelatedLocations);
      }
    } catch (error) {
      console.error('Error updating location name references:', error);
    }
  }

  private async updateBidirectionalRelationshipsById(
    currentLocationId: string,
    oldRelatedLocationIds: string[],
    newRelatedLocationIds: string[]
  ) {
    const allLocations = await this.getAllWorldLocations();

    // Find locations that were removed from relationships
    const removedRelations = oldRelatedLocationIds.filter(
      id => !newRelatedLocationIds.includes(id)
    );

    // Find locations that were added to relationships
    const addedRelations = newRelatedLocationIds.filter(
      id => !oldRelatedLocationIds.includes(id)
    );

    // Remove bidirectional relationships
    for (const removedLocationId of removedRelations) {
      const location = allLocations.find(loc => loc.id === removedLocationId);
      if (location && location.related_locations.includes(currentLocationId)) {
        const updatedRelatedLocations = location.related_locations.filter(
          (id: string) => id !== currentLocationId
        );
        await this.updateLocationRelationshipsOnly(location.id, updatedRelatedLocations);
      }
    }

    // Add bidirectional relationships
    for (const addedLocationId of addedRelations) {
      const location = allLocations.find(loc => loc.id === addedLocationId);
      if (location && !location.related_locations.includes(currentLocationId)) {
        const updatedRelatedLocations = [...location.related_locations, currentLocationId];
        await this.updateLocationRelationshipsOnly(location.id, updatedRelatedLocations);
      }
    }
  }

  private async updateLocationRelationshipsOnly(locationID: string, relatedLocations: string[]) {
    try {
      const location = await this.getWorldLocationById(locationID);
      if (!location) return;

      const response = await fetch(`${this.url}/${locationID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...location,
          relatedLocations: relatedLocations,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update related location relationships: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating related location relationships:', error);
    }
  }

  createWorldLocation(event: WorldLocationInfo, goToPage: boolean): Observable<WorldLocationInfo | null> {
    return this.http.post<WorldLocationInfo>(`${this.url}/`, event)
        .pipe(catchError(error => {
            console.error('Error creating location:', error);
            return of(null);
      }));
  }

  async deleteWorldLocation(locationID: string) {
    console.log(`Deleting location with ID: ${locationID}`);
    this.http.delete(`${this.url}/${locationID}/`).subscribe({
      next: () => {
        console.log('Location deleted successfully');
        this.router.navigate(['/locations']);
      },
      error: (error) => {
        console.error('Error deleting location:', error);
        alert('Failed to delete location: ' + error.message);
      }
    });
  }

  private async removeLocationFromAllRelationships(deletedLocationName: string) {
    try {
      const allLocations = await this.getAllWorldLocations();
      
      // Find all locations that have the deleted location in their related list
      const locationsToUpdate = allLocations.filter(location => 
        location.related_locations.includes(deletedLocationName)
      );
      
      // Update each location to remove the deleted location
      for (const location of locationsToUpdate) {
        const updatedRelatedLocations = location.related_locations.filter(
          name => name !== deletedLocationName
        );
        await this.updateLocationRelationshipsOnly(location.id, updatedRelatedLocations);
      }
    } catch (error) {
      console.error('Error removing location from relationships:', error);
    }
  }
}
