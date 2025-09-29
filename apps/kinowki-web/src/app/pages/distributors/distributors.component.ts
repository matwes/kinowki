import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  map,
  of,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import { DistributorDto, genres, ReleaseDto } from '@kinowki/shared';
import { DistributorService, ReleaseService } from '../../services';
import { ImdbPipe, notEmpty, ReleaseTypeIconPipe } from '../../utils';
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
    TableModule,
    ToastModule,
  ],
  providers: [ConfirmationService, DialogService, MessageService],
})
export class DistributorsComponent {
  @ViewChild('flyersTable', { static: true }) flyersTable!: Table;

  genres = genres;
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  private data$ = this.lazyEvent.pipe(
    debounceTime(500),
    switchMap((lazyEvent) => this.distributorService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));

  selection: DistributorDto[] = [];
  selectedDistributor$ = new BehaviorSubject<DistributorDto | null>(null);

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
      lazyEvent.filters['distributor'] = { value: distributor._id };
      return this.releaseService.getAll(lazyEvent);
    })
  );
  releases$ = this.releaseData$.pipe(map((res) => res.data));
  releasesTotalRecords$ = this.releaseData$.pipe(map((res) => res.totalRecords));

  today = this.getToday();
  currentYear = new Date().getFullYear();

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: DialogService,
    private readonly distributorService: DistributorService,
    private readonly releaseService: ReleaseService
  ) {}

  onDistributorSelected(distributor: DistributorDto) {
    if (this.selectedDistributor$.value) {
      this.flyersTable.first = 0;
      this.flyersTable.reset();
    }
    this.selectedDistributor$.next(distributor);
  }

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
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
