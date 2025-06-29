import { Route } from '@angular/router';
import { DistributorsComponent, FilmsComponent, FlyersComponent, ReleasesComponent } from './pages';

export const appRoutes: Route[] = [
  { path: 'filmy', component: FilmsComponent },
  { path: 'premiery', component: ReleasesComponent },
  { path: 'ulotki', component: FlyersComponent },
  { path: 'dystrybutorzy', component: DistributorsComponent },
  { path: '**', redirectTo: '/filmy' },
];
