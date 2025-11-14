import {Routes} from '@angular/router';
import {Home} from './home/home';
import {WorldEventDetails} from './world-event-details/world-event-details';
import { WorldLocationDetails } from './world-location-details/world-location-details';
import { WorldCharacterDetails } from './world-character-details/world-character-details';
import { WorldStoryDetails } from './world-story-details/world-story-details';

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
  {
    path: 'location-details/:id',
    component: WorldLocationDetails,
    title: 'Location details',
  },
  {
    path: 'character-details/:id',
    component: WorldCharacterDetails,
    title: 'Character details',
  },
  {
    path: 'story-details/:id',
    component: WorldStoryDetails,
    title: 'Story details',
  }
];
export default routeConfig;