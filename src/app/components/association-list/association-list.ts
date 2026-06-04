import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface AssociationItem {
  id: string;
  name: string;
  isAssociated: boolean;
  altNames?: string[];
  ageAtEvent?: number;
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

  showAssociatedOnly: boolean = true;

  get visibleItems(): AssociationItem[] {
    return this.showAssociatedOnly ? this.items.filter(i => i.isAssociated) : this.items;
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

  goToEntityHome() {
    const baseRoute = this.type;
    const worldId = this.items.length > 0 && this.items[0].id ? this.items[0].id.split('-')[0] : null;
    if (worldId) {
      window.location.href = `/${baseRoute}?world=${worldId}`;
    } else {
      window.location.href = `/${baseRoute}`;
    }
  }
}