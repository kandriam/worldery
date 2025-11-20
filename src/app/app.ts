import {Component} from '@angular/core';
import {Home} from './home/home';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Home, RouterModule],
  template: `
    <main>
        <header class="nav-bar">
          <button class="nav-button nav-brand" [routerLink]="['/']">
            <img class="header-icon" src="assets/worldery-tab-icon.png" alt="Worldery icon">
            Worldery
          </button>
          <button class="nav-button primary">Timeline</button>
          <button class="nav-button primary">World</button>
          <button class="nav-button primary">Characters</button>
          <button class="nav-button primary">Stories</button>
        </header>
      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'App';
}
