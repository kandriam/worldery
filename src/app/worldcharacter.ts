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
    relationships: string[];
    // events: string[];
    // locations: string[];
    stories: string[];
    tags: string[];
}

export interface worldCharacterRelationship {
    characterId: number;
    relatedCharacterId: number;
    relationshipType: string[];
    relationshipDescription: string;
}