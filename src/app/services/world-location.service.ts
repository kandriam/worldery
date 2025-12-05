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

  async getWorldLocationById(id: string): Promise<WorldLocationInfo | undefined> {
    const data = await fetch(`${this.url}?id=${id}`);
    const locationJson = await data.json();
    return locationJson[0] ?? {};
  }

  async updateWorldLocation(locationID: string, locationName: string, locationDescription: string, locationCharacters: string[], locationStories: string[], locationRelatedLocations: string[], locationTags: string[]) {
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
    
    try {
      // Get the current location to see what relationships have changed
      const currentLocation = await this.getWorldLocationById(locationID);
      const currentRelatedLocations = currentLocation?.relatedLocations || [];
      const oldLocationName = currentLocation?.name || '';
      
      // Update the main location
      const response = await fetch(`${this.url}/${locationID}`, {
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
          relatedLocations: locationRelatedLocations,
          tags: locationTags,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update location: ${response.statusText}`);
      }
      
      // Handle name changes - update references in other locations
      if (oldLocationName !== locationName) {
        await this.updateLocationNameReferences(oldLocationName, locationName);
      }
      
      // Handle bidirectional relationship updates
      await this.updateBidirectionalRelationships(
        locationName,
        currentRelatedLocations,
        locationRelatedLocations
      );
      
      console.log('Location updated successfully with bidirectional relationships');
      return await response.json();
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  private async updateLocationNameReferences(oldName: string, newName: string) {
    try {
      const allLocations = await this.getAllWorldLocations();
      
      // Find all locations that reference the old name
      const locationsToUpdate = allLocations.filter(location => 
        location.relatedLocations.includes(oldName)
      );
      
      // Update each location to use the new name
      for (const location of locationsToUpdate) {
        const updatedRelatedLocations = location.relatedLocations.map(
          name => name === oldName ? newName : name
        );
        await this.updateLocationRelationshipsOnly(location.id, updatedRelatedLocations);
      }
    } catch (error) {
      console.error('Error updating location name references:', error);
    }
  }

  private async updateBidirectionalRelationships(
    currentLocationName: string,
    oldRelatedLocations: string[],
    newRelatedLocations: string[]
  ) {
    const allLocations = await this.getAllWorldLocations();
    
    // Find locations that were removed from relationships
    const removedRelations = oldRelatedLocations.filter(
      name => !newRelatedLocations.includes(name)
    );
    
    // Find locations that were added to relationships
    const addedRelations = newRelatedLocations.filter(
      name => !oldRelatedLocations.includes(name)
    );
    
    // Remove bidirectional relationships
    for (const removedLocationName of removedRelations) {
      const location = allLocations.find(loc => loc.name === removedLocationName);
      if (location && location.relatedLocations.includes(currentLocationName)) {
        const updatedRelatedLocations = location.relatedLocations.filter(
          name => name !== currentLocationName
        );
        await this.updateLocationRelationshipsOnly(location.id, updatedRelatedLocations);
      }
    }
    
    // Add bidirectional relationships
    for (const addedLocationName of addedRelations) {
      const location = allLocations.find(loc => loc.name === addedLocationName);
      if (location && !location.relatedLocations.includes(currentLocationName)) {
        const updatedRelatedLocations = [...location.relatedLocations, currentLocationName];
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
          id: locationID,
          name: location.name,
          description: location.description,
          characters: location.characters,
          stories: location.stories,
          relatedLocations: relatedLocations,
          tags: location.tags,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update related location relationships: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating related location relationships:', error);
    }
  }

  async createWorldLocation(locationName: string, locationDescription: string, locationCharacters: string[], locationStories: string[], locationTags: string[]) {
    console.log(
      `Location created:
      locationName: ${locationName},
      locationDescription: ${locationDescription},
      locationCharacters: ${locationCharacters},
      locationStories: ${locationStories},
      locationTags: ${locationTags}.`,
    );

    try {
      const locations = await this.getAllWorldLocations();
      console.log('Current locations count:', locations.length);
      
      // determine next id as string
      const maxId = locations.length > 0 ? Math.max(...locations.map(e => parseInt(e.id.toString()))) : 0;
      const newId = (maxId + 1).toString();
      
      const response = await fetch(this.url, {
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
          relatedLocations: [],
          tags: locationTags,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create location: ${response.statusText}`);
      }
      
      console.log('Location created successfully');
      const newLocation = await response.json();
      window.location.reload();
      return newLocation;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  async deleteWorldLocation(locationID: string) {
    console.log(`Deleting location with ID: ${locationID}`);
    try {
      // Get the location being deleted to clean up relationships
      const locationToDelete = await this.getWorldLocationById(locationID);
      if (!locationToDelete) {
        throw new Error('Location not found');
      }
      
      // Remove this location from all other locations' related lists
      await this.removeLocationFromAllRelationships(locationToDelete.name);
      
      const response = await fetch(`${this.url}/${locationID}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete location: ${response.statusText}`);
      }
      
      console.log('Location deleted successfully with relationship cleanup');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  private async removeLocationFromAllRelationships(deletedLocationName: string) {
    try {
      const allLocations = await this.getAllWorldLocations();
      
      // Find all locations that have the deleted location in their related list
      const locationsToUpdate = allLocations.filter(location => 
        location.relatedLocations.includes(deletedLocationName)
      );
      
      // Update each location to remove the deleted location
      for (const location of locationsToUpdate) {
        const updatedRelatedLocations = location.relatedLocations.filter(
          name => name !== deletedLocationName
        );
        await this.updateLocationRelationshipsOnly(location.id, updatedRelatedLocations);
      }
    } catch (error) {
      console.error('Error removing location from relationships:', error);
    }
  }
}
