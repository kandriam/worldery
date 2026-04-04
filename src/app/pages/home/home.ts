import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WorldInfo, WorldInfoService } from '../../services/world.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: 'home.html',
  styleUrls: ['./home.css', '../pages.css', '../../../styles.css'],
})
export class Home {
  worldInfoService: WorldInfoService = inject(WorldInfoService);
  router: Router = inject(Router);

  worlds: WorldInfo[] = [];
  showCreateForm = false;

  createForm = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
  });

  constructor() {
    this.worldInfoService.getWorlds().subscribe(worlds => {
      this.worlds = worlds;
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  createWorld() {
    const { title, description } = this.createForm.value;
    const newWorld = {
      id: '',
      title: title || 'New World',
      description: description || '',
      timeSystem: '',
      genres: [],
      owner: '',
    } as WorldInfo;
    this.worldInfoService.createWorld(newWorld).subscribe(created => {
      if (created) {
        this.worlds.push(created);
        this.createForm.reset();
        this.showCreateForm = false;
      }
    });
  }
}
