import { DatePipe, registerLocaleData } from '@angular/common';
import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import localePl from '@angular/common/locales/pl';
import { ApplicationConfig, inject, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { catchError, throwError } from 'rxjs';

import { appRoutes } from './app.routes';
import { AuthService } from './services';

registerLocaleData(localePl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const authService = inject(AuthService);
          const token = authService.token;
          if (token) {
            req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          }

          return next(req).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 401 || error.error?.message?.includes('expired')) {
                authService.logout();
              }

              return throwError(() => error);
            })
          );
        },
      ])
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.darkmode' } } }),
    { provide: LOCALE_ID, useValue: 'pl' },
    DatePipe,
  ],
};
