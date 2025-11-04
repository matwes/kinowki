import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, FilterMetadata, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

import { DistributorDto, genres, ReleaseDto } from '@kinowki/shared';
import { DistributorService, ReleaseService } from '../../services';
import { ImdbPipe, notEmpty, ReleaseTypeIconPipe, ShowIfAdminDirective } from '../../utils';
import { DistributorDialogComponent } from './distributor-dialog';
import { FlyerComponent } from '../flyer';

@UntilDestroy()
@Component({
  selector: 'app-distributors',
  templateUrl: './distributors.component.html',
  styleUrl: './distributors.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    FlyerComponent,
    FormsModule,
    ImdbPipe,
    InputTextModule,
    ReactiveFormsModule,
    ReleaseTypeIconPipe,
    ShowIfAdminDirective,
    TableModule,
    ToastModule,
  ],
  providers: [ConfirmationService, DialogService],
})
export class DistributorsComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly distributorService = inject(DistributorService);
  private readonly releaseService = inject(ReleaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('distributorsTable', { static: true }) distributorsTable!: Table;
  @ViewChild('flyersTable', { static: true }) flyersTable!: Table;

  genres = genres;
  event?: TableLazyLoadEvent;

  lazyEvent = new Subject<TableLazyLoadEvent>();
  filters$ = new BehaviorSubject<{ [s: string]: FilterMetadata | FilterMetadata[] | undefined } | undefined>({});

  distributorNameSearch: string | undefined;

  data$ = combineLatest([this.lazyEvent, this.filters$]).pipe(
    debounceTime(500),
    map(([lazyEvent, filters]) => ({ ...lazyEvent, filters })),
    switchMap((event) => this.distributorService.getAll(event)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));

  selection: { _id: string }[] = [];
  selectedDistributor$ = new BehaviorSubject<string | null>(null);

  // releases

  releasesEvent?: TableLazyLoadEvent;
  releasesLazyEvent = new Subject<TableLazyLoadEvent>();

  private releaseData$ = combineLatest([
    this.releasesLazyEvent,
    this.selectedDistributor$.pipe(filter((distributor) => !!distributor)),
  ]).pipe(
    debounceTime(500),
    switchMap(([, distributor]) => {
      const lazyEvent = this.releasesEvent;
      if (!lazyEvent) {
        return of<{ data: ReleaseDto[]; totalRecords: number }>({ data: [], totalRecords: 0 });
      }
      if (!lazyEvent.filters) {
        lazyEvent.filters = {};
      }
      lazyEvent.filters['distributor'] = { value: distributor };
      return this.releaseService.getAll(lazyEvent);
    })
  );
  releases$ = this.releaseData$.pipe(map((res) => res.data));
  releasesTotalRecords$ = this.releaseData$.pipe(map((res) => res.totalRecords));

  today = this.getToday();
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((params) => {
        const filters: { [s: string]: FilterMetadata | FilterMetadata[] | undefined } = {};

        const distributorName = params['nazwa'] as string | undefined;
        const distributor = params['dystrybutor'] as string | undefined;
        const first = +params['p'] || 0;

        if (distributorName) {
          filters['name'] = { value: distributorName };
          this.distributorNameSearch = distributorName;
        } else {
          this.distributorNameSearch = undefined;
        }

        if (distributor) {
          this.selectedDistributor$.next(distributor);
          this.selection = [{ _id: distributor }];
        } else {
          this.selectedDistributor$.next(null);
          this.selection = [];
        }

        this.filters$.next(filters);

        this.distributorsTable.first = first;
        this.lazyLoad({ first, rows: 10 });
      });
  }

  onDistributorSelected(distributor: DistributorDto) {
    if (this.selectedDistributor$.value) {
      this.flyersTable.first = 0;
      this.flyersTable.reset();
    }
    this.selectedDistributor$.next(distributor._id);
    this.updateUrl();
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

  lazyLoadReleases(releasesEvent?: TableLazyLoadEvent) {
    if (releasesEvent) {
      this.releasesEvent = releasesEvent;
    }
    if (this.releasesEvent) {
      this.releasesLazyEvent.next(this.releasesEvent);
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
      this.distributorsTable.first = 0;
      this.updateUrl();
      this.lazyEvent.next(this.event);
    }
  }

  private updateUrl() {
    const filters = this.filters$.value;
    const distributor = this.selectedDistributor$.value;

    const params: Record<string, string | number> = {
      p: this.event?.first || 0,
    };

    if (filters) {
      const distributorName = filters['name'];

      if (distributorName && !Array.isArray(distributorName) && distributorName.value) {
        params['nazwa'] = distributorName.value;
      }
    }

    if (distributor) {
      params['dystrybutor'] = distributor;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: '',
    });
  }

  openDistributorDialog(item?: DistributorDto) {
    this.dialogService
      .open(DistributorDialogComponent, {
        data: { item },
        header: item ? 'Edytuj dystrybutora' : 'Dodaj dystrybutora',
        width: '40%',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(
        untilDestroyed(this),
        filter(notEmpty),
        switchMap((data) =>
          item ? this.distributorService.update(item._id, data) : this.distributorService.create(data)
        ),
        tap(() => this.lazyLoad())
      )
      .subscribe();
  }

  deleteDistributor(item: DistributorDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć dystrybutora „${item.name}”?`,
      header: 'Usuń dystrybutora',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.distributorService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto dystrybutora „${item.name}”`,
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
