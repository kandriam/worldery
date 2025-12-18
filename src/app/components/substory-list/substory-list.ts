import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface SubstoryItem {
  id: string;
  name: string;
  isSubstory: boolean;
  subStoryOrder?: number;
}

export type EntityType = 'character' | 'event' | 'location' | 'story';

@Component({
  selector: 'app-substory-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './substory-list.html',
  styleUrls: ['./substory-list.css']
})
export class SubstoryList {
  @Input() stories: SubstoryItem[] = [];
  @Input() substoryIds: string[] | undefined = [];
  @Input() label: string = 'Associations';
  @Input() type: EntityType = 'story';

  @Output() itemToggled = new EventEmitter<{id: string, isChecked: boolean}>();
  @Output() substoryOrderChanged = new EventEmitter<string[]>();

  changeSubstoryOrder(event: Event, storyId: string, direction: 'up' | 'down') {
    console.log(this.substoryIds);
    event.stopPropagation();
    if (!this.substoryIds) return;
    const idx = this.substoryIds.indexOf(storyId);
    if (idx === -1) return;
    if (direction === 'up' && idx > 0) {
      [this.substoryIds[idx - 1], this.substoryIds[idx]] = [this.substoryIds[idx], this.substoryIds[idx - 1]];
      this.updateCheckedState();
      this.substoryOrderChanged.emit([...this.substoryIds]);
    } else if (direction === 'down' && idx < this.substoryIds.length - 1) {
      [this.substoryIds[idx + 1], this.substoryIds[idx]] = [this.substoryIds[idx], this.substoryIds[idx + 1]];
      this.updateCheckedState();
      this.substoryOrderChanged.emit([...this.substoryIds]);
    }
    console.log(this.substoryIds);
  }

  ngOnChanges() {
    this.updateCheckedState();
  }

  updateCheckedState() {
    if (!this.stories || !this.substoryIds) return;
    for (const story of this.stories) {
      story.isSubstory = this.substoryIds.includes(story.id);
    }
  }

  get substoryList() {
    if (!this.substoryIds) return [];
    // Return substories in the order of substoryIds
    return this.substoryIds
      .map(id => this.stories.find(story => story.id === id))
      .filter((story): story is SubstoryItem => !!story);
  }

  get nonSubstoryList() {
    return this.stories.filter(story => !story.isSubstory);
  }

  get routePrefix(): string {
    return this.type;
  }

  onItemChange(event: Event, itemId: string) {
    event.stopPropagation();
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      this.itemToggled.emit({ id: itemId, isChecked });
    }
  }
}