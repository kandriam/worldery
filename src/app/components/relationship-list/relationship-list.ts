import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorldCharacterInfo, worldCharacterRelationship } from '../../worldcharacter';

@Component({
  selector: 'app-relationship-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './relationship-list.html',
  styleUrls: ['./relationship-list.css']
})
export class RelationshipList {
  @Input() filteredCharacterList: WorldCharacterInfo[] = [];
  @Input() relationshipFilter: 'all' | 'with-relationship' | 'without-relationship' = 'with-relationship';
  @Input() storyFilter: string = 'all';
  @Input() availableStories: string[] = [];
  @Input() getRelationshipFn: (characterId: string) => worldCharacterRelationship | undefined = () => undefined;

  @Output() relationshipToggled = new EventEmitter<{event: Event, characterId: string}>();
  @Output() relationshipFilterChanged = new EventEmitter<'all' | 'with-relationship' | 'without-relationship'>();
  @Output() storyFilterChanged = new EventEmitter<string>();

  toggleRelationship(event: Event, characterId: string) {
    this.relationshipToggled.emit({event, characterId});
  }

  setRelationshipFilter(filter: 'all' | 'with-relationship' | 'without-relationship') {
    this.relationshipFilterChanged.emit(filter);
  }

  onStoryFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.storyFilterChanged.emit(select?.value || 'all');
  }

  getRelationship(characterId: string): worldCharacterRelationship | undefined {
    return this.getRelationshipFn(characterId);
  }
}