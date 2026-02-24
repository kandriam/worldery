export interface WorldCharacterInfo {
    id: string;
    // name: string;
    personal_name: string;
    family_name: string;
    altNames: string[];
    physicalDescription: string;
    nonPhysicalDescription: string;

    pronouns: string;
    birthdate?: string;
    deathdate?: string;
    birthEventId?: string; // Event ID for birth
    deathEventId?: string; // Event ID for death
    roles: string[];
    affiliations: string[];
    relationships: worldCharacterRelationship[];
    // events: string[];
    // locations: string[];
    stories: string[];
    tags: string[];
}

export interface worldCharacterRelationship {
    relatedCharacterID: string;
    hasRelationship: boolean;
    relationshipType: string[];
    relationshipDescription: string;
}