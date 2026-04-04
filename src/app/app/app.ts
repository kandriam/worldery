import {Component} from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import { WorldInfo, WorldInfoService } from '../services/world.service';
import { SettingsService } from '../services/settings.service';

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

  constructor(worldInfoService: WorldInfoService, settingsService: SettingsService) {
    this.worldInfoService = worldInfoService;
    settingsService.applyColors();
    settingsService.applyFontSize();
  }
}
