import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, FilterMetadata, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

import { months, ReleaseDto } from '@kinowki/shared';
import { ReleaseService } from '../../services';
import { DistributorBadgeComponent, ImdbPipe, ReleaseDatePipe, ShowIfAdminDirective } from '../../utils';
import { FlyerComponent } from '../flyer';

const FIRST_YEAR = 1990;
const LAST_YEAR = new Date().getFullYear() + 1;

@UntilDestroy()
@Component({
  selector: 'app-releases',
  templateUrl: './releases.component.html',
  styleUrl: './releases.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    DistributorBadgeComponent,
    FlyerComponent,
    FormsModule,
    ImdbPipe,
    InputTextModule,
    MultiSelectModule,
    ReleaseDatePipe,
    SelectButtonModule,
    SelectModule,
    ShowIfAdminDirective,
    TableModule,
    ToastModule,
    ToolbarModule,
  ],
  providers: [ConfirmationService, DialogService, ReleaseService],
})
export class ReleasesComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly releaseService = inject(ReleaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild(Table, { static: true }) table!: Table;

  options = {
    years: Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => LAST_YEAR - i),
    months,
  };
  today = this.getToday();
  event?: TableLazyLoadEvent;

  lazyEvent = new Subject<TableLazyLoadEvent>();
  filters$ = new BehaviorSubject<{ [s: string]: FilterMetadata | FilterMetadata[] | undefined } | undefined>({});

  yearSearch: number | undefined = new Date().getFullYear();
  monthSearch: number | undefined = new Date().getMonth() + 1;

  data$ = combineLatest([this.lazyEvent, this.filters$]).pipe(
    debounceTime(500),
    map(([lazyEvent, filters]) => ({ ...lazyEvent, filters })),
    switchMap((event) => this.releaseService.getAll(event)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((params) => {
        const now = new Date();
        const yearParam = Number(params['r']);
        const monthParam = Number(params['m']);

        const year = this.options.years.includes(yearParam) ? yearParam : now.getFullYear();
        const month = monthParam >= 1 && monthParam <= 12 ? monthParam : now.getMonth() + 1;

        this.yearSearch = year;
        this.monthSearch = month;

        this.filters$.next({
          year: { value: year },
          month: { value: month },
        });
      });
  }

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.updateUrl();
      this.lazyEvent.next(this.event);
    }
  }

  filter(field: string, value: string | number | (string | number)[]) {
    const filters = { ...(this.filters$.value || {}) };
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) {
      delete filters[field];
    } else {
      filters[field] = { value };
    }
    this.filters$.next(filters);

    if (this.event) {
      this.event.first = 0;
      this.table.first = 0;
      this.updateUrl();
      this.lazyEvent.next(this.event);
    }
  }

  private updateUrl() {
    const filters = this.filters$.value;
    const params: Record<string, string | number> = {};

    if (filters) {
      const year = filters['year'];
      const month = filters['month'];

      if (year && !Array.isArray(year) && year.value) {
        params['r'] = year.value;
      }
      if (month && !Array.isArray(month) && month.value) {
        params['m'] = month.value;
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: '',
    });
  }

  prevMonth() {
    if (this.yearSearch && this.monthSearch) {
      if (this.monthSearch === 1) {
        if (this.yearSearch === 1990) {
          return;
        }
        this.monthSearch = 12;
        this.yearSearch--;
        this.filter('year', this.yearSearch);
      } else {
        this.monthSearch--;
      }
      this.filter('month', this.monthSearch);
    }
  }

  nextMonth() {
    if (this.yearSearch && this.monthSearch) {
      if (this.monthSearch === 12) {
        this.monthSearch = 1;
        this.yearSearch++;
        this.filter('year', this.yearSearch);
      } else {
        this.monthSearch++;
      }
      this.filter('month', this.monthSearch);
    }
  }

  deleteRelease(item: ReleaseDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć premierę „${item.date}”?`,
      header: 'Usuń premirę',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.releaseService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto premierę „${item.date}”`,
              life: 3000,
            });
          });
      },
    });
  }

  getToday() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
