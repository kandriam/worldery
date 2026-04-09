// Removed stray getter outside the class definition
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { WorldInfo, WorldInfoService } from '../services/world.service';
import { SettingsService } from '../services/settings.service';
import { CurrentWorldService } from '../services/current-world.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet],
  templateUrl: 'app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  title = 'App';
  currentWorldName: string | null = null;
  
  get currentWorldId(): string | null {
    return this.currentWorldService.getCurrentWorldId();
  }
  
  constructor(
    private worldInfoService: WorldInfoService,
    private settingsService: SettingsService,
    public currentWorldService: CurrentWorldService,
    private router: Router
  ) {
    settingsService.applyColors();
    settingsService.applyFontSize();
  }
  
  goToCurrentWorld() {
    if (this.currentWorldId) {
      this.router.navigate(['/world'], { queryParams: { id: this.currentWorldId } });
    } else {
      this.router.navigate(['/']);
    }
  }

  goToPage(page: string) {
    if (this.currentWorldId) {
      this.router.navigate([`/${page}`], { queryParams: { world: this.currentWorldId } });
    } else {
      this.router.navigate([`/${page}`]);
    }
  }
  ngOnInit() {
    this.updateCurrentWorldName();
    // Update current world name on every navigation end
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateCurrentWorldName();
      }
    });
  }

  private lastWorldId: string | null = null;

  // private updateCurrentWorldName() {
  //   const id = this.currentWorldId;
  //   if (id !== this.lastWorldId) {
  //     this.lastWorldId = id;
  //     if (id) {
  //       this.worldInfoService.getWorld(id).subscribe(world => {
  //         this.currentWorldName = world?.title || null;
  //       });
  //     } else {
  //       this.currentWorldName = null;
  //     }
  //   }
  // }
  private updateCurrentWorldName() {
    const id = this.currentWorldId;
    if (id) {
      this.worldInfoService.getWorld(id).subscribe(world => {
        this.currentWorldName = world?.title || null;
      });
    } else {
      this.currentWorldName = null;
    }
  }
}
