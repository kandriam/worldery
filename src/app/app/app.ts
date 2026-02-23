import {Component} from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import { WorldInfo } from '../world';
import {WorldInfoService} from '..//services/world.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet],
  templateUrl: 'app.html',
  styleUrls: ['./app.css'],
})
export class App {
  title = 'App';

  world: WorldInfo | undefined;
  worldInfoService: WorldInfoService;

  constructor(worldInfoService: WorldInfoService) {
    this.worldInfoService = worldInfoService;
    this.worldInfoService.getWorld('0').subscribe(world => {
      this.world = world || undefined;
    });
  }
}
