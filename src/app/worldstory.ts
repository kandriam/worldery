export interface WorldStoryInfo {
    id: string;
    title: string;
    description: string;
    characters: string[];
    locations: string[];
    substories: string[];
    parentStoryId?: string;
    genre: string[];
    tags: string[];
}