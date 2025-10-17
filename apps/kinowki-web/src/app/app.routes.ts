import { Route } from '@angular/router';
import {
  ActivateComponent,
  ContactComponent,
  DistributorsComponent,
  FilmsComponent,
  FlyersComponent,
  ReleasesComponent,
  ResetPasswordComponent,
  TagsComponent,
} from './pages';

export const appRoutes: Route[] = [
  { path: 'ulotki', component: FlyersComponent },
  { path: 'filmy', component: FilmsComponent },
  { path: 'premiery', component: ReleasesComponent },
  { path: 'dystrybutorzy', component: DistributorsComponent },
  { path: 'tagi', component: TagsComponent },
  { path: 'kontakt', component: ContactComponent },
  { path: 'activate', component: ActivateComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: '/ulotki' },
];
