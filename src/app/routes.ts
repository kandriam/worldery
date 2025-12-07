import {Routes} from '@angular/router';
import {Home} from './pages/home/home';
import {WorldEventDetails} from './details/event-details/event-details';
import { WorldLocationDetails } from './details/location-details/location-details';
import { WorldCharacterDetails } from './details/character-details/character-details';
import { WorldStoryDetails } from './details/story-details/story-details';
import { EventHome } from './pages/event-home/event-home';
import { LocationHome } from './pages/location-home/location-home';
import { CharacterHome } from './pages/character-home/character-home';
import { StoryHome } from './pages/story-home/story-home';
import { Settings } from './pages/settings/settings';

const routeConfig: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home page',
  },
  {
    path: 'event',
    component: EventHome,
    title: 'Event Timeline',
  },
  {
    path: 'event/:id',
    component: WorldEventDetails,
    title: 'Event details',
  },
  {
    path: 'location',
    component: LocationHome,
    title: 'Locations',
  },
  {
    path: 'location/:id',
    component: WorldLocationDetails,
    title: 'Location details',
  },
  {
    path: 'character',
    component: CharacterHome,
    title: 'Characters',
  },
  {
    path: 'character/:id',
    component: WorldCharacterDetails,
    title: 'Character details',
  },
  {
    path: 'story',
    component: StoryHome,
    title: 'Stories',
  },
  {
    path: 'story/:id',
    component: WorldStoryDetails,
    title: 'Story details',
  },
  {
    path: 'settings',
    component: Settings,
    title: 'Settings',
  }
];
export default routeConfig;