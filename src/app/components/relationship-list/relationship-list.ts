import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorldCharacterInfo, WorldCharacterService } from '../../services/world-character.service';
import { RelationshipInfo, RelationshipService } from '../../services/relationship.service';

@Component({
  selector: 'app-relationship-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './relationship-list.html',
  styleUrls: ['./relationship-list.css']
})
export class RelationshipList {
  @Input() primaryCharacterId: string = '';
  @Input() availableStories: string[] = [];
  characterService: WorldCharacterService = inject(WorldCharacterService);
  characterList: WorldCharacterInfo[] = [];
  filteredCharacterList: WorldCharacterInfo[] = [];
  relationshipService: RelationshipService = inject(RelationshipService);
  relationshipList: RelationshipInfo[] = [];
  relationshipMap: { [key: string]: RelationshipInfo } = {};
  relationshipFilter: 'all' | 'with-relationship' | 'without-relationship' = 'all';

  constructor() {}

  async ngOnInit() {
    this.loadRelationshipData();
  }
  
  async loadRelationshipData() {
    // Load all characters
    this.characterList = await this.characterService.getAllWorldCharacters();
    this.filteredCharacterList = this.characterList.filter(character => character.id !== this.primaryCharacterId);
    // Load all relationships and build relationship map for fast lookup

    this.relationshipList = await this.relationshipService.getallRelationship();
    this.relationshipMap = {};
    for (const rel of this.relationshipList) {
      const key = rel.primary_character + '-' + rel.secondary_character;
      this.relationshipMap[key] = rel;
    }
    // Apply filters to update filteredCharacterList for UI
    this.loadRelationshipUI();
    await this.applyFilters();
  }

  loadRelationshipUI() {
    // Update all relationship type and description fields by id
    for (const rel of this.relationshipList) {
      const typeElement = document.getElementById(`relationship-type-${rel.secondary_character}`) as HTMLInputElement;
      // Type Element
      const type = Array.isArray(rel.relationship_type) && rel.relationship_type.length > 0 ? rel.relationship_type.join(', ') : '';
      // if (typeElement) {
      //   typeElement = typeElement as HTMLInputElement;
      // }
    }
  }


  async applyFilters(): Promise<void> {
    console.log('applyFilters called, filter:', this.relationshipFilter);
    if (!this.characterList || !this.primaryCharacterId) {
      this.filteredCharacterList = [];
      return;
    }
    const primaryId = this.primaryCharacterId;
    const filtered: WorldCharacterInfo[] = [];
    for (const character of this.characterList) {
      if (character.id === primaryId) continue;
      const rel = this.relationshipList.find(rel => rel.primary_character === primaryId && rel.secondary_character === character.id);
      const hasRelationship = rel?.has_relationship === true;
      if (this.relationshipFilter === 'with-relationship' && !hasRelationship) continue;
      if (this.relationshipFilter === 'without-relationship' && hasRelationship) continue;
      // if (this.storyFilter !== 'all') {
      //   const characterStories = character.stories || [];
      //   if (!characterStories.includes(this.storyFilter)) continue;
      // }
      filtered.push(character);
    }
    this.filteredCharacterList = filtered;
    // await this.updateRelationshipUI();
  }

  getRelationship(primaryCharacterId: string, secondaryCharacterId: string): RelationshipInfo | undefined {
    // Use precomputed map for fast lookup
    const key = primaryCharacterId + '-' + secondaryCharacterId;
    return this.relationshipMap[key];
  }

  async setRelationshipFilterAsync(filter: 'all' | 'with-relationship' | 'without-relationship') {
    console.log('setRelationshipFilterAsync called with:', filter);
    this.relationshipFilter = filter;
    await this.applyFilters();
  }

  onStoryFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.applyFilters();
  }

  updateRelationship(secondaryCharacterId: string, relationshipId: string) {
    console.log('updateRelationship called for characters:', this.primaryCharacterId, secondaryCharacterId);
    const hasRelationship = (document.getElementById(`relationship-checkbox-${secondaryCharacterId}`) as HTMLInputElement)?.checked || false;
    const typeInput = document.getElementById(`relationship-type-${secondaryCharacterId}`) as HTMLInputElement;
    const descriptionInput = document.getElementById(`relationship-description-${secondaryCharacterId}`) as HTMLTextAreaElement;
    const relationshipType = typeInput?.value || '';
    const relationshipDescription = descriptionInput?.value || '';
    const relationship: RelationshipInfo = {
      id: relationshipId,
      primary_character: this.primaryCharacterId,
      secondary_character: secondaryCharacterId,
      has_relationship: hasRelationship,
      relationship_type: relationshipType ? relationshipType.split(',').map(s => s.trim()) : [],
      relationship_description: relationshipDescription,
    };
    console.log('Constructed relationship object for update:', relationship);
    this.relationshipService.updateRelationship(relationship);
  }

  toggleRelationship(event: Event, secondaryCharacterId: string) {
    console.log('toggleRelationship called for secondary character ID:', secondaryCharacterId);
    const checkbox = event.target as HTMLInputElement;  
    const hasRelationship = checkbox.checked;
    const relationship: RelationshipInfo = {
      id: '', // ID will be set by backend
      primary_character: this.primaryCharacterId,
      secondary_character: secondaryCharacterId,
      has_relationship: hasRelationship,
      relationship_type: [], // You can extend this to include relationship type selection
      relationship_description: '', // You can extend this to include relationship description input
    };
    this.relationshipService.updateRelationship(relationship);
  }
  
}