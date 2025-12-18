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
  @Input() entityType!: EntityType;
  @Input() title!: string;
  @Input() routePath!: string;
  @Input() entities!: EntityData;

  get filteredStories(): WorldStoryInfo[] {
    if (this.entityType !== 'story' || !Array.isArray(this.entities)) return this.entities as WorldStoryInfo[];
    const stories = this.entities as WorldStoryInfo[];
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