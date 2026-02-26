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
    this.loadRelationships();
  }
  
  async loadRelationships() {
    this.characterList = await this.characterService.getAllWorldCharacters();
    this.filteredCharacterList = this.characterList.filter(character => character.id !== this.primaryCharacterId);
    for (const character of this.filteredCharacterList) {
      console.log('Character:', character.personal_name, character.family_name);
    }
    this.relationshipList = await this.relationshipService.getallRelationship();
    // Build relationship map for fast lookup
    this.relationshipMap = {};
    for (const rel of this.relationshipList) {
      const key = rel.primary_character + '-' + rel.secondary_character;
      this.relationshipMap[key] = rel;
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

  updateRelationship(primaryCharacterId: string, secondaryCharacterId: string, relationshipType: string[], relationshipDescription: string) {
    console.log('updateRelationship called for characters:', primaryCharacterId, secondaryCharacterId);
  }

  toggleRelationship(event: Event, secondaryCharacterId: string) {
    console.log('toggleRelationship called for secondary character ID:', secondaryCharacterId);
  }
}