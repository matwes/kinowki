import { Route } from '@angular/router';
import { DistributorsComponent, FilmsComponent, FlyersComponent, ReleasesComponent, TagsComponent } from './pages';

export const appRoutes: Route[] = [
  { path: 'filmy', component: FilmsComponent },
  { path: 'premiery', component: ReleasesComponent },
  { path: 'ulotki', component: FlyersComponent },
  { path: 'dystrybutorzy', component: DistributorsComponent },
  { path: 'tagi', component: TagsComponent },
  { path: '**', redirectTo: '/filmy' },
];
