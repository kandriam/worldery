import { Injectable } from '@angular/core';
import { WorldInfo } from './world.service';

@Injectable({ providedIn: 'root' })
export class CurrentWorldService {
  private readonly STORAGE_KEY = 'currentWorldId';

  setCurrentWorld(world: WorldInfo) {
    localStorage.setItem(this.STORAGE_KEY, world.id);
  }

  getCurrentWorldId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  clearCurrentWorld() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
