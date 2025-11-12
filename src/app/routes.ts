import {Routes} from '@angular/router';
import {Home} from './home/home';
import {WorldEventDetails} from './world-event-details/world-event-details';

const routeConfig: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home page',
  },
  {
    path: 'event-details/:id',
    component: WorldEventDetails,
    title: 'Event details',
  },
];
export default routeConfig;