import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

import { FlyerDto, TagDto, flyerSizes, flyerTypes, genres, releaseTypes } from '@kinowki/shared';
import { FlyerService, TagService } from '../../services';
import {
  CopyFlyerNameButtonComponent,
  JoinPipe,
  ReleaseTypeNamePipe,
  ShowIfAdminDirective,
  ShowIfLoggedDirective,
  UserFlyerStatusButtonComponent,
  UserFlyerStatusClassDirective,
  notEmpty,
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
    CopyFlyerNameButtonComponent,
    DataViewModule,
    FormsModule,
    ImageModule,
    InputTextModule,
    JoinPipe,
    PopoverModule,
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
  providers: [ConfirmationService, DialogService],
})
export class FlyersComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly flyerService = inject(FlyerService);
  private readonly tagService = inject(TagService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('flyersView', { static: true }) flyersView!: DataView;

  genres = genres;
  flyerTypes = flyerTypes;
  flyerSizes = flyerSizes;
  releaseTypes = releaseTypes;
  event?: TableLazyLoadEvent;

  lazyEvent = new Subject<TableLazyLoadEvent>();
  filters$ = new BehaviorSubject<{ [s: string]: FilterMetadata | FilterMetadata[] | undefined } | undefined>({});

  data$ = combineLatest([this.lazyEvent, this.filters$]).pipe(
    debounceTime(500),
    map(([lazyEvent, filters]) => ({ ...lazyEvent, filters })),
    switchMap((event) => this.flyerService.getAll(event)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));
  tags: TagDto[] = [];

  flyerSizeSearch: number | undefined;
  flyerTypesSearch: number | undefined;
  flyerNameSearch: string | undefined;
  flyerTagSearch: string | undefined;

  private tagsFetched = false;

  ngOnInit(): void {
    this.tagService
      .getAll()
      .pipe(
        untilDestroyed(this),
        tap((res) => (this.tags = res.data)),
        switchMap(() => this.route.queryParams),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((params) => {
        this.tagsFetched = true;

        const filters: { [s: string]: FilterMetadata | FilterMetadata[] | undefined } = {};

        const flyerSize = params['rozmiar'];
        const flyerType = params['typ'];
        const id = params['nazwa'];
        const flyerTag = params['tag'];
        const first = +params['p'] || 0;

        if (flyerSize) {
          const flyerSizeNumber = Number(flyerSize);
          if (flyerSizes.some((size) => size.value === flyerSizeNumber)) {
            filters['flyerSize'] = { value: flyerSizeNumber };
            this.flyerSizeSearch = flyerSizeNumber;
          } else {
            this.flyerSizeSearch = undefined;
          }
        } else {
          this.flyerSizeSearch = undefined;
        }

        if (flyerType) {
          const flyerTypeNumber = Number(flyerType);
          if (flyerTypes.some((type) => type.value === flyerTypeNumber)) {
            filters['flyerType'] = { value: flyerType };
            this.flyerTypesSearch = flyerTypeNumber;
          } else {
            this.flyerTypesSearch = undefined;
          }
        } else {
          this.flyerTypesSearch = undefined;
        }

        if (id) {
          filters['id'] = { value: id };
          this.flyerNameSearch = id;
        } else {
          this.flyerNameSearch = undefined;
        }

        if (flyerTag) {
          if (this.tags.some((tag) => tag._id === flyerTag)) {
            filters['flyerTags'] = { value: flyerTag };
            this.flyerTagSearch = flyerTag;
          } else {
            this.flyerTagSearch = undefined;
          }
        } else {
          this.flyerTagSearch = undefined;
        }

        this.filters$.next(filters);

        this.flyersView.first = first;
        this.lazyLoad({ first, rows: 10 });
      });
  }

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      if (this.tagsFetched) {
        this.updateUrl();
      }
      this.lazyEvent.next(this.event);
    }
  }

  filter(field: string, value: string | number) {
    const filters = { ...(this.filters$.value || {}) };
    if (value === undefined || value === null || value === '') {
      delete filters[field];
    } else {
      filters[field] = { value };
    }
    this.filters$.next(filters);

    if (this.event) {
      this.event.first = 0;
      this.flyersView.first = 0;
      this.updateUrl();
      this.lazyEvent.next(this.event);
    }
  }

  private updateUrl() {
    const filters = this.filters$.value;
    const params: Record<string, string | number> = {
      p: this.event?.first || 0,
    };

    if (filters) {
      const flyerType = filters['flyerType'];
      const flyerSize = filters['flyerSize'];
      const id = filters['id'];
      const flyerTags = filters['flyerTags'];

      if (flyerType && !Array.isArray(flyerType) && flyerType.value) {
        params['typ'] = flyerType.value;
      }
      if (flyerSize && !Array.isArray(flyerSize) && flyerSize.value) {
        params['rozmiar'] = flyerSize.value;
      }
      if (id && !Array.isArray(id) && id.value) {
        params['nazwa'] = id.value;
      }
      if (flyerTags && !Array.isArray(flyerTags) && flyerTags.value) {
        params['tag'] = flyerTags.value;
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: '',
    });
  }

  openFlyerDialog(item?: FlyerDto) {
    this.dialogService
      .open(FlyerDialogComponent, {
        data: { item, tags: this.tags },
        header: item ? 'Edytuj ulotkę' : 'Dodaj ulotkę',
        closeOnEscape: false,
        modal: true,
        width: '40vw',
        breakpoints: {
          '1400px': '75vw',
          '640px': '90vw',
        },
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
