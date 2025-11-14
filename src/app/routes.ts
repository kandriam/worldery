import {Routes} from '@angular/router';
import {Home} from './home/home';
import {WorldEventDetails} from './event-details/event-details';
import { WorldLocationDetails } from './location-details/location-details';
import { WorldCharacterDetails } from './character-details/character-details';
import { WorldStoryDetails } from './story-details/story-details';

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