import { PrimeNG } from 'primeng/config';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { SidebarComponent } from './layout';
import { AuthService } from './services';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
  providers: [MessageService],
  imports: [RouterModule, SidebarComponent, ToastModule],
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly primengConfig = inject(PrimeNG);
  private readonly title = inject(Title);

  ngOnInit() {
    this.title.setTitle('Kinówki - Polskie ulotki filmowe');

    this.primengConfig.setTranslation({
      dayNames: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'],
      dayNamesShort: ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'],
      dayNamesMin: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
      monthNames: [
        'styczeń',
        'luty',
        'marzec',
        'kwiecień',
        'maj',
        'czerwiec',
        'lipiec',
        'sierpień',
        'wrzesień',
        'październik',
        'listopad',
        'grudzień',
      ],
      monthNamesShort: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
      today: 'Dziś',
      clear: 'Wyczyść',
      weekHeader: 'Tydz.',
      firstDayOfWeek: 1,
      dateFormat: 'dd.mm.yy',
    });

    this.authService
      .checkToken()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (user) => this.authService.updateUser(user),
        error: (err) => {
          if (err.status === 401) {
            this.authService.logout();
          }
        },
      });
  }
}
