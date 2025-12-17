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
  @Output() relationshipsChanged = new EventEmitter<worldCharacterRelationship[]>();

  emitAllRelationships() {
    const relationships = (this.filteredCharacterList || [])
      .map((character: any) => {
        const checkbox = document.getElementById(`relationship-checkbox-${character.id}`) as HTMLInputElement;
        const isChecked = checkbox?.checked ?? false;
        const typeInput = document.getElementById(`relationship-type-${character.id}`) as HTMLInputElement;
        const relationshipTypes = typeInput?.value?.split(',').map((type: string) => type.trim()) ?? [];
        const descInput = document.getElementById(`relationship-description-${character.id}`) as HTMLTextAreaElement;
        const descriptionText = descInput?.value ?? '';
        return {
          relatedCharacterID: character.id,
          relationshipType: relationshipTypes,
          hasRelationship: isChecked,
          relationshipDescription: descriptionText
        };
      })
      .filter((rel: worldCharacterRelationship) => rel.hasRelationship);
    this.relationshipsChanged.emit(relationships);
  }
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
    this.emitAllRelationships();
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