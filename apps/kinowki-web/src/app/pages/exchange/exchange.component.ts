import { AsyncPipe } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DataView, DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { combineLatest, debounceTime, filter, map, of, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { FlyerDto, UserDto } from '@kinowki/shared';
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
export class ExchangeComponent {
  private readonly userService = inject(UserService);
  private readonly userFlyerService = inject(UserFlyerService);
  private readonly fb = inject(NonNullableFormBuilder);

  @ViewChild('flyersView', { static: true }) flyersDataView!: DataView;

  state = this.fb.control(undefined as undefined | { user: UserDto; state: 'have' | 'trade' | 'want' });

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
      tap((value) => {
        this.state.setValue(value, { emitEvent: false });
        if (value) {
          if (value.state === 'have') {
            this.flyersTitle.set(`${value.user.name} - ulotki w kolekcji`);
          } else if (value.state === 'trade') {
            this.flyersTitle.set(`${value.user.name} - ulotki na wymianę`);
          } else if (value.state === 'want') {
            this.flyersTitle.set(`${value.user.name} - ulotki poszukiwane`);
          }
        } else {
          this.flyersTitle.set('Wybierz kolekcję do przeglądania klikając na przycisk z liczbą z listy użytkowników');
        }

        this.flyersDataView.first = 0;
        this.flyersDataView.ngOnInit();
      }),
      filter((value) => !!value)
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
      lazyEvent.filters['user'] = { value: res.user._id };
      lazyEvent.filters['state'] = { value: res.state };
      return this.userFlyerService.getFlyers(lazyEvent);
    })
  );
  flyers$ = this.flyersData$.pipe(map((res) => res.data));
  flyersTotalRecords$ = this.flyersData$.pipe(map((res) => res.totalRecords));

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
      this.flyersLazyEvent.next(this.flyersEvent);
    }
  }
}
