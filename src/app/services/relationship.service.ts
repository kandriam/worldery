import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface RelationshipInfo {
    id: string;
    primary_character: string;
    secondary_character: string;
    has_relationship: boolean;
    relationship_type: string[]
    relationship_description: string;
}

@Injectable({
  providedIn: 'root',
})

export class RelationshipService {
    url = 'http://localhost:8000/api/relationships';

    constructor(private router: Router, private http: HttpClient) {}

    async getallRelationship(): Promise<RelationshipInfo[]> {
        const data = await this.http.get<RelationshipInfo[]>(this.url).toPromise();
        return data ?? [];
    }

    async getRelationshipById(id: string): Promise<RelationshipInfo | undefined> {
        // Use RESTful detail endpoint for correct character
        const data = await fetch(`${this.url}/${id}/`);
        if (!data.ok) {
            console.error('Failed to fetch character by id:', id);
            return undefined;
        }
        const relationshipJson = await data.json();
        return relationshipJson;
    }

    async getRelationshipsByCharacter(name: string): Promise<RelationshipInfo[] | undefined> {
        const data = await fetch(`${this.url}?character=${encodeURIComponent(name)}`);
        if (!data.ok) {
            console.error('Failed to fetch relationships for character:', name);
            return undefined;
        }
        const relationshipJson = await data.json();
        return relationshipJson;
    }

    async relationshipExists(primaryName: string, secondaryName: string): Promise<boolean> {
        try {
            const relationship = await this.http.get<RelationshipInfo>(`${this.url}?primary=${encodeURIComponent(primaryName)}&secondary=${encodeURIComponent(secondaryName)}`).toPromise();
            console.log('Checked:', primaryName, secondaryName, 'Result:', relationship);
            return relationship !== null && relationship !== undefined;
        } catch (error) {
            return false;
        }
    }

    async getRelationshipByCharacters(primaryName: string, secondaryName: string): Promise<RelationshipInfo | undefined> {
        try {
            const result = await this.http.get<any>(`${this.url}?primary=${encodeURIComponent(primaryName)}&secondary=${encodeURIComponent(secondaryName)}`).toPromise();
            let relationship: RelationshipInfo | undefined = undefined;
            if (Array.isArray(result)) {
                // If backend returns an array, find the exact match
                relationship = result.find((rel: RelationshipInfo) => rel.primary_character === primaryName && rel.secondary_character === secondaryName);
            } else if (result && result.primary_character && result.secondary_character) {
                // If backend returns a single object
                if (result.primary_character === primaryName && result.secondary_character === secondaryName) {
                    relationship = result;
                }
            }
            console.log('Fetched relationship for characters:', primaryName, secondaryName, 'Result:', relationship);
            return relationship ?? undefined;
        } catch (error) {
            console.error('Error fetching relationship for characters:', primaryName, secondaryName, error);
            return undefined;
        }
    }

    createRelationship(relationship: RelationshipInfo): Observable<RelationshipInfo | null> {
        const payload = {
            primary_character: relationship.primary_character,
            secondary_character: relationship.secondary_character,
            has_relationship: relationship.has_relationship,
            relationship_type: relationship.relationship_type,
            relationship_description: relationship.relationship_description,
        }
        console.log('!! Creating relationship with data:', payload);
        return this.http.post<RelationshipInfo>(`${this.url}/`, payload)
            .pipe(catchError(error => {
                console.error('Error creating relationship::', error);
                return of(null);
            }));
    }

    async deleteRelationship(relationshipID: string) {
        console.log(`Deleting relationship with ID: ${relationshipID}`);
        this.http.delete(`${this.url}/${relationshipID}/`).subscribe({
            next: () => {
                console.log('Relationship deleted successfully');
                this.router.navigate(['/characterrelationships']);
            },
            error: (error) => {
                console.error('Error deleting relationship:', error);
                alert('Failed to delete relationship: ' + error.message);
            }
        });
    }

    async updateRelationship(relationship: RelationshipInfo) {
        // Always check for an existing relationship by primary and secondary character
        const existing = await this.getRelationshipByCharacters(relationship.primary_character, relationship.secondary_character);
        console.log("exists?", existing, "for characters:", relationship.primary_character, relationship.secondary_character);
        if (!existing) {
            // Create new relationship
            return await this.createRelationship(relationship).toPromise();
        } else {
            // Update existing relationship
            const payload = {
                primary_character: relationship.primary_character,
                secondary_character: relationship.secondary_character,
                has_relationship: relationship.has_relationship,
                relationship_type: relationship.relationship_type,
                relationship_description: relationship.relationship_description,
            };
            return this.http.put(`${this.url}/${existing.id}/`, payload)
                .pipe(catchError(error => {
                    console.error('Error updating relationship:', error);
                    throw error;
                })).toPromise().then((updatedRelationship: any) => {
                    console.log('Relationship updated successfully', updatedRelationship);
                    return updatedRelationship;
                });
        }
    }
}