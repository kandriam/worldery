export interface WorldCharacterInfo {
    id: number;
    // name: string;
    firstName: string;
    lastName: string;
    altNames: string[];
    physicalDescription: string;
    nonPhysicalDescription: string;

    pronouns: string;
    birthdate: string;
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