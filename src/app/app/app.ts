import {Component} from '@angular/core';
import {Home} from '../home/home';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Home, RouterModule],
  templateUrl: 'app.html',
  styleUrls: ['./app.css'],
})
export class App {
  title = 'App';
}
