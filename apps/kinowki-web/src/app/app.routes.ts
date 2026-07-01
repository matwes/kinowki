import { Route } from '@angular/router';
import {
  ActivateComponent,
  ContactComponent,
  DistributorsComponent,
  ExchangeComponent,
  FilmComponent,
  FilmGroupsComponent,
  FilmsComponent,
  FlyersComponent,
  ReleasesComponent,
  ResetPasswordComponent,
  TagsComponent,
  UserSettingsComponent,
} from './pages';

export const appRoutes: Route[] = [
  { path: 'ulotki', component: FlyersComponent },
  { path: 'filmy', component: FilmsComponent },
  { path: 'film/:id', component: FilmComponent },
  { path: 'premiery', component: ReleasesComponent },
  { path: 'dystrybutorzy', component: DistributorsComponent },
  { path: 'wymiana', component: ExchangeComponent },
  { path: 'grupy', component: FilmGroupsComponent },
  { path: 'tagi', component: TagsComponent },
  { path: 'kontakt', component: ContactComponent },
  { path: 'ustawienia', component: UserSettingsComponent },
  { path: 'activate', component: ActivateComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: '/ulotki' },
];
