import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { SidebarComponent } from './layout';

@Component({
  imports: [RouterModule, SidebarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent implements OnInit {
  private readonly primengConfig = inject(PrimeNG);
  private readonly title = inject(Title);

  ngOnInit() {
    this.title.setTitle('Kinówki');

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
  }
}
