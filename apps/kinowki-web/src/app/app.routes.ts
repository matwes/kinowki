import { Route } from '@angular/router';
import { FilmsComponent, FlyersComponent, ReleasesComponent } from './pages';

export const appRoutes: Route[] = [
  { path: 'filmy', component: FilmsComponent },
  { path: 'premiery', component: ReleasesComponent },
  { path: 'ulotki', component: FlyersComponent },
  { path: '**', redirectTo: '/filmy' },
];
