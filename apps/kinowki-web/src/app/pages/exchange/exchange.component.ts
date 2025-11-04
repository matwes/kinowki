import { AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DataView, DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
  EMPTY,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

import { FlyerDto } from '@kinowki/shared';
import { UserFlyerService, UserService } from '../../services';
import { JoinPipe } from '../../utils';
import { FlyerComponent } from '../flyer';

@UntilDestroy()
@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrl: './exchange.component.sass',
  imports: [AsyncPipe, DataViewModule, FlyerComponent, JoinPipe, ReactiveFormsModule, SelectButtonModule, TableModule],
})
export class ExchangeComponent implements AfterViewInit {
  private readonly userService = inject(UserService);
  private readonly userFlyerService = inject(UserFlyerService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('flyersView', { static: true }) flyersDataView!: DataView;

  state = this.fb.control(undefined as undefined | { user: string; state: 'have' | 'trade' | 'want' });

  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  private data$ = this.lazyEvent.pipe(
    debounceTime(500),
    switchMap((lazyEvent) => this.userService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));

  // flyers

  flyersTitle = signal('Wybierz kolekcję do przeglądania klikając na przycisk z liczbą z listy użytkowników');

  flyersEvent?: TableLazyLoadEvent;
  flyersLazyEvent = new Subject<TableLazyLoadEvent>();

  private flyersData$ = combineLatest([
    this.flyersLazyEvent,
    this.state.valueChanges.pipe(
      tap((value) => this.state.setValue(value, { emitEvent: false })),
      tap(() => {
        this.flyersDataView.first = 0;
        this.flyersDataView.ngOnInit();
        this.updateUrl();
      }),
      switchMap((value) => {
        if (!value) {
          this.flyersTitle.set('Wybierz kolekcję do przeglądania klikając na przycisk z liczbą z listy użytkowników');
          return EMPTY;
        }

        return this.userService.get(value.user).pipe(
          map((res) => res.data),
          tap((user) => {
            const titles: Record<string, string> = {
              have: `${user.name} - ulotki w kolekcji`,
              trade: `${user.name} - ulotki na wymianę`,
              want: `${user.name} - ulotki poszukiwane`,
            };
            this.flyersTitle.set(titles[value.state] ?? user.name);
          }),
          map(() => value)
        );
      })
    ),
  ]).pipe(
    debounceTime(500),
    switchMap(([, res]) => {
      const lazyEvent = this.flyersEvent;
      if (!lazyEvent) {
        return of<{ data: FlyerDto[]; totalRecords: number }>({ data: [], totalRecords: 0 });
      }
      if (!lazyEvent.filters) {
        lazyEvent.filters = {};
      }
      lazyEvent.filters['user'] = { value: res.user };
      lazyEvent.filters['state'] = { value: res.state };
      return this.userFlyerService.getFlyers(lazyEvent);
    })
  );
  flyers$ = this.flyersData$.pipe(map((res) => res.data));
  flyersTotalRecords$ = this.flyersData$.pipe(map((res) => res.totalRecords));

  ngAfterViewInit(): void {
    this.route.queryParams
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((params) => {
        const first = +params['p'] || 0;

        if (params['uzytkownik'] && params['status'] && ['have', 'trade', 'want'].includes(params['status'])) {
          this.state.setValue({ user: params['uzytkownik'], state: params['status'] });
        } else {
          this.state.setValue(undefined);
        }

        this.flyersDataView.first = first;
        this.lazyLoadFlyers({ first, rows: 20 });
      });
  }

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  lazyLoadFlyers(flyersEvent?: TableLazyLoadEvent) {
    if (flyersEvent) {
      this.flyersEvent = flyersEvent;
    }
    if (this.flyersEvent) {
      this.updateUrl();
      this.flyersLazyEvent.next(this.flyersEvent);
    }
  }

  private updateUrl() {
    const filters = this.state.value;

    const params: Record<string, string | number> = {
      p: this.flyersEvent?.first || 0,
    };

    if (filters) {
      params['uzytkownik'] = filters.user;
      params['status'] = filters.state;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: '',
    });
  }
}
