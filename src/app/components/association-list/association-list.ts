import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface AssociationItem {
  id: string;
  name: string;
  isAssociated: boolean;
}

export type EntityType = 'character' | 'event' | 'location' | 'story';

@Component({
  selector: 'app-association-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './association-list.html',
  styleUrls: ['./association-list.css']
})
export class AssociationList {
  @Input() items: AssociationItem[] = [];
  @Input() label: string = 'Associations';
  @Input() type: EntityType = 'story';
  
  @Output() itemToggled = new EventEmitter<{id: string, isChecked: boolean}>();

  get routePrefix(): string {
    return this.type;
  }

  onItemChange(event: Event, itemId: string) {
    if (event.target instanceof HTMLInputElement) {
      const isChecked = event.target.checked;
      this.itemToggled.emit({ id: itemId, isChecked });
    }
  }
}