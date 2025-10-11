import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, FilterMetadata, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule, DataView } from 'primeng/dataview';
import { DialogService } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, combineLatest, debounceTime, filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { FlyerDto, TagDto, flyerSizes, flyerTypes, genres, releaseTypes } from '@kinowki/shared';
import { FlyerService, TagService } from '../../services';
import {
  JoinPipe,
  notEmpty,
  ReleaseTypeNamePipe,
  ShowIfAdminDirective,
  ShowIfLoggedDirective,
  UserFlyerStatusClassDirective,
  UserFlyerStatusButtonComponent,
} from '../../utils';
import { BigFlyerComponent } from '../big-flyer';
import { FlyerDialogComponent } from './flyer-dialog';

@UntilDestroy()
@Component({
  selector: 'app-flyers',
  templateUrl: './flyers.component.html',
  styleUrl: './flyers.component.sass',
  imports: [
    BigFlyerComponent,
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    DataViewModule,
    FormsModule,
    ImageModule,
    InputTextModule,
    JoinPipe,
    PopoverModule,
    ReactiveFormsModule,
    ReleaseTypeNamePipe,
    SelectButtonModule,
    SelectModule,
    ShowIfAdminDirective,
    ShowIfLoggedDirective,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    UserFlyerStatusButtonComponent,
    UserFlyerStatusClassDirective,
  ],
  providers: [ConfirmationService, DialogService, MessageService],
})
export class FlyersComponent implements AfterViewInit {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly flyerService = inject(FlyerService);
  private readonly tagService = inject(TagService);

  @ViewChild('flyersView', { static: true }) flyersView!: DataView;

  genres = genres;
  flyerTypes = flyerTypes;
  flyerSizes = flyerSizes;
  releaseTypes = releaseTypes;
  event?: TableLazyLoadEvent;
  restoredEvent?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  filters$ = new BehaviorSubject<{ [s: string]: FilterMetadata | FilterMetadata[] | undefined } | undefined>({});

  data$ = combineLatest([this.lazyEvent, this.filters$]).pipe(
    debounceTime(500),
    map(([lazyEvent, filters]) => {
      const event = { ...lazyEvent, filters };
      localStorage.setItem('flyer-table', JSON.stringify(event));
      return event;
    }),
    switchMap((event) => this.flyerService.getAll(event)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));
  tags: TagDto[] = [];

  flyerSizeSearch = '';
  flyerTypesSearch = '';
  flyerNameSearch = '';
  flyerTagSearch = '';

  constructor() {
    this.tagService.getAll().subscribe((res) => (this.tags = res.data));
    const event = localStorage.getItem('flyer-table');
    if (event) {
      this.restoredEvent = JSON.parse(event);
    }
  }

  ngAfterViewInit(): void {
    if (this.restoredEvent) {
      const filters = this.restoredEvent.filters;
      this.lazyLoad(this.restoredEvent);
      this.filters$.next(filters);

      this.flyerSizeSearch = (filters?.['flyerSize'] as FilterMetadata | undefined)?.value || undefined;
      this.flyerTypesSearch = (filters?.['flyerType'] as FilterMetadata | undefined)?.value || undefined;
      this.flyerNameSearch = (filters?.['id'] as FilterMetadata | undefined)?.value || undefined;
      this.flyerTagSearch = (filters?.['flyerTags'] as FilterMetadata | undefined)?.value || undefined;

      this.flyersView.first = this.restoredEvent.first;
      this.flyersView.rows = this.restoredEvent.rows ?? 20;
    }
  }

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  filter(field: string, value: string | number) {
    let filters = this.filters$.value;
    if (!filters) {
      filters = {};
    }
    if (value === undefined || value === null || value === '') {
      delete filters[field];
    } else {
      filters[field] = { value };
    }
    this.filters$.next(filters);

    if (this.event) {
      this.event.first = 0;
      this.lazyEvent.next(this.event);
      this.flyersView.first = 0;
    }
  }

  openFlyerDialog(item?: FlyerDto) {
    this.dialogService
      .open(FlyerDialogComponent, {
        data: { item, tags: this.tags },
        header: item ? 'Edytuj ulotkę' : 'Dodaj ulotkę',
        width: '90vw',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(
        untilDestroyed(this),
        filter(notEmpty),
        switchMap((data) => (item ? this.flyerService.update(item._id, data) : this.flyerService.create(data))),
        tap(() => this.lazyLoad())
      )
      .subscribe();
  }

  deleteFlyer(item: FlyerDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć ulotkę „${item.id}”?`,
      header: 'Usuń ulotke',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.flyerService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto ulotkę „${item.id}”`,
              life: 3000,
            });
          });
      },
    });
  }
}
