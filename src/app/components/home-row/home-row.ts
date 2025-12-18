export interface HomeRowFilterIds {
  characterIds?: string[];
  storyIds?: string[];
  locationIds?: string[];
  eventIds?: string[];
}
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventThumbnail } from '../thumbnail/event-thumbnail/event-thumbnail';
import { LocationThumbnail } from '../thumbnail/location-thumbnail/location-thumbnail';
import { CharacterThumbnail } from '../thumbnail/character-thumbnail/character-thumbnail';
import { StoryThumbnail } from '../thumbnail/story-thumbnail/story-thumbnail';
import { WorldEventInfo } from '../../worldevent';
import { WorldLocationInfo } from '../../worldlocation';
import { WorldCharacterInfo } from '../../worldcharacter';
import { WorldStoryInfo } from '../../worldstory';

export type EntityType = 'event' | 'location' | 'character' | 'story';
export type EntityData = WorldEventInfo[] | WorldLocationInfo[] | WorldCharacterInfo[] | WorldStoryInfo[];

@Component({
  selector: 'app-home-row',
  standalone: true,
  imports: [CommonModule, RouterLink, EventThumbnail, LocationThumbnail, CharacterThumbnail, StoryThumbnail],
  templateUrl: './home-row.html',
  styleUrls: ['./home-row.css']
})
export class HomeRow {
  @Input() filterIds?: HomeRowFilterIds;

  get filteredEntities(): EntityData {
    if (!this.filterIds) return this.entities;
    if (this.entityType === 'character') {
      let chars = this.entities as WorldCharacterInfo[];
      const filterByChar = this.filterIds.characterIds && this.filterIds.characterIds.length;
      const filterByStory = this.filterIds.storyIds && this.filterIds.storyIds.length;
      if (filterByChar && filterByStory) {
        // Intersection: must match both
        chars = chars.filter(e =>
          this.filterIds!.characterIds!.includes(e.id) &&
          Array.isArray(e.stories) && e.stories.some(storyId => this.filterIds!.storyIds!.includes(storyId))
        );
      } else if (filterByChar) {
        chars = chars.filter(e => this.filterIds!.characterIds!.includes(e.id));
      } else if (filterByStory) {
        chars = chars.filter(e => Array.isArray(e.stories) && e.stories.some(storyId => this.filterIds!.storyIds!.includes(storyId)));
      }
      return chars;
    }
    if (this.entityType === 'story' && this.filterIds.storyIds && this.filterIds.storyIds.length) {
      return (this.entities as WorldStoryInfo[]).filter(e => this.filterIds!.storyIds!.includes(e.id));
    }
    if (this.entityType === 'location' && this.filterIds.locationIds && this.filterIds.locationIds.length) {
      return (this.entities as WorldLocationInfo[]).filter(e => this.filterIds!.locationIds!.includes(e.id));
    }
    if (this.entityType === 'event' && this.filterIds.eventIds && this.filterIds.eventIds.length) {
      return (this.entities as WorldEventInfo[]).filter(e => this.filterIds!.eventIds!.includes(e.id));
    }
    return this.entities;
  }
  @Input() entityType!: EntityType;
  @Input() title!: string;
  @Input() routePath!: string;
  @Input() entities!: EntityData;

  get filteredStories(): WorldStoryInfo[] {
    const stories = this.filteredEntities as WorldStoryInfo[];
    // Collect all substory IDs from all stories
    const allSubstoryIds = new Set<string>();
    for (const story of stories) {
      if (Array.isArray(story.substories)) {
        for (const subId of story.substories) {
          allSubstoryIds.add(subId);
        }
      }
    }
    // Only return stories that are NOT a substory of any other story
    return stories.filter(story => !allSubstoryIds.has(story.id));
  }
  @Input() noResultsMessage!: string;
  
  @Output() addElement = new EventEmitter<EntityType>();
  @Output() tagClicked = new EventEmitter<string>();
  
  // Display toggles
  showDate = true;
  showLocation = true;
  showCharacters = true;
  showStories = true;
  
  onAddElement() {
    this.addElement.emit(this.entityType);
  }
  
  onTagClick(tag: string) {
    this.tagClicked.emit(tag);
  }
  
  toggleDate() {
    this.showDate = !this.showDate;
  }
  
  toggleLocation() {
    this.showLocation = !this.showLocation;
  }
  
  toggleCharacters() {
    this.showCharacters = !this.showCharacters;
  }
  
  toggleStories() {
    this.showStories = !this.showStories;
  }
  
  getEntityDisplayName(): string {
    const displayNames: Record<EntityType, string> = {
      'event': 'Event',
      'location': 'Location', 
      'character': 'Character',
      'story': 'Story'
    };
    return displayNames[this.entityType];
  }
  
  // Type guards for template usage
  isEventList(entities: EntityData): entities is WorldEventInfo[] {
    return this.entityType === 'event';
  }
  
  isLocationList(entities: EntityData): entities is WorldLocationInfo[] {
    return this.entityType === 'location';
  }
  
  isCharacterList(entities: EntityData): entities is WorldCharacterInfo[] {
    return this.entityType === 'character';
  }
  
  isStoryList(entities: EntityData): entities is WorldStoryInfo[] {
    return this.entityType === 'story';
  }
  
  // Methods to determine which display buttons should be shown
  shouldShowDateButton(): boolean {
    return this.entityType === 'event' || this.entityType === 'character';
  }
  
  shouldShowLocationButton(): boolean {
    return this.entityType === 'event' || this.entityType === 'story' || this.entityType === 'location';
  }
  
  shouldShowCharactersButton(): boolean {
    return this.entityType === 'event' || this.entityType === 'location' || this.entityType === 'story';
  }
  
  shouldShowStoriesButton(): boolean {
    return this.entityType === 'event' || this.entityType === 'character' || this.entityType === 'location';
  }
}