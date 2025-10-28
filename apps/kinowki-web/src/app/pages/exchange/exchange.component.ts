import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserDto } from '@kinowki/shared';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { BehaviorSubject, debounceTime, map, shareReplay, Subject, switchMap } from 'rxjs';
import { UserService } from '../../services';

@UntilDestroy()
@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrl: './exchange.component.sass',
  imports: [AsyncPipe, TableModule],
})
export class ExchangeComponent {
  private readonly userService = inject(UserService);

  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  private data$ = this.lazyEvent.pipe(
    debounceTime(500),
    switchMap((lazyEvent) => this.userService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));

  selection: UserDto[] = [];
  selectedUser$ = new BehaviorSubject<UserDto | null>(null);

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  onUserSelected(user: UserDto) {
    if (this.selectedUser$.value) {
      // TODO update flyers table
    }
    this.selectedUser$.next(user);
  }
}
