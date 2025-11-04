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
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

import {
  CreateReleaseDto,
  DistributorDto,
  FilmDto,
  UpdateDistributorDto,
  UpdateReleaseDto,
  genres,
} from '@kinowki/shared';
import { DistributorService, FilmService, ReleaseService } from '../../services';
import { DistributorBadgeComponent, GenreNamePipe, ImdbPipe, notEmpty, ShowIfAdminDirective } from '../../utils';
import { FlyerComponent } from '../flyer';
import { FilmDialogComponent } from './film-dialog';
import { letters } from './letters';

@UntilDestroy()
@Component({
  selector: 'app-films',
  templateUrl: './films.component.html',
  styleUrl: './films.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    DistributorBadgeComponent,
    FlyerComponent,
    FormsModule,
    GenreNamePipe,
    ImdbPipe,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    SelectButtonModule,
    SelectModule,
    ShowIfAdminDirective,
    TableModule,
    TagModule,
    ToastModule,
  ],
  providers: [ConfirmationService, DialogService],
})
export class FilmsComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly filmService = inject(FilmService);
  private readonly distributorService = inject(DistributorService);
  private readonly releaseService = inject(ReleaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild(Table, { static: true }) table!: Table;

  genres = genres;
  letters = ['#', ...letters];
  event?: TableLazyLoadEvent;

  lazyEvent = new Subject<TableLazyLoadEvent>();
  filters$ = new BehaviorSubject<{ [s: string]: FilterMetadata | FilterMetadata[] | undefined } | undefined>({});

  filmLetterSearch: string | undefined;
  filmTitleSearch: string | undefined;
  filmGenreSearch: number[] | undefined;

  data$ = combineLatest([this.lazyEvent, this.filters$]).pipe(
    debounceTime(500),
    map(([lazyEvent, filters]) => ({ ...lazyEvent, filters })),
    switchMap((event) => this.filmService.getAll(event)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));
  private distributors?: DistributorDto[];

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((params) => {
        const filters: { [s: string]: FilterMetadata | FilterMetadata[] | undefined } = {};

        const letter = params['l'] as string | undefined;
        const title = params['tytul'] as string | undefined;
        const genres = params['gatunek'] as string | undefined;
        const first = +params['p'] || 0;

        if (letter) {
          filters['letter'] = { value: letter[0] };
          this.filmLetterSearch = letter[0];
        } else {
          this.filmLetterSearch = undefined;
        }

        if (title) {
          filters['title'] = { value: title };
          this.filmTitleSearch = title;
        } else {
          this.filmTitleSearch = undefined;
        }

        if (genres) {
          const value = genres
            .split(',')
            .map((genre) => Number(genre))
            .filter((genre) => !isNaN(genre) && this.genres.some((g) => g.value === genre));

          if (value.length) {
            filters['genres'] = { value };
            this.filmGenreSearch = value;
          } else {
            this.filmGenreSearch = undefined;
          }
        } else {
          this.filmGenreSearch = undefined;
        }

        this.filters$.next(filters);

        this.table.first = first;
        this.lazyLoad({ first, rows: 20 });
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

  onGenreClear() {
    this.filmGenreSearch = undefined;
    this.filter('genres', []);
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
    const params: Record<string, string | number> = {
      p: this.event?.first || 0,
    };

    if (filters) {
      const letter = filters['letter'];
      const title = filters['title'];
      const genres = filters['genres'];

      if (letter && !Array.isArray(letter) && letter.value) {
        params['l'] = letter.value;
      }
      if (title && !Array.isArray(title) && title.value) {
        params['tytul'] = title.value;
      }
      if (genres && !Array.isArray(genres) && genres.value) {
        params['gatunek'] = genres.value.join(',');
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: '',
    });
  }

  openFilmDialog(item?: FilmDto) {
    const distributors$ = this.distributors
      ? of(this.distributors)
      : this.distributorService.getAll().pipe(
          map((res) => res.data),
          tap((distributors) => (this.distributors = distributors)),
          shareReplay(1)
        );

    distributors$
      .pipe(
        untilDestroyed(this),
        switchMap(
          (distributors) =>
            this.dialogService.open(FilmDialogComponent, {
              data: { item, distributors },
              header: item ? 'Edytuj film' : 'Dodaj film',
              width: '90%',
              closeOnEscape: false,
              modal: true,
            }).onClose
        ),
        filter(notEmpty),
        switchMap((data) =>
          (item ? this.filmService.update(item._id, data) : this.filmService.create(data)).pipe(
            switchMap((res) =>
              forkJoin(
                (data.releases as (CreateReleaseDto | UpdateReleaseDto)[])
                  .map((release) => ({ ...release, film: res.data._id }))
                  .map((release) =>
                    this.isCreateDto(release)
                      ? this.releaseService.create({ ...release })
                      : this.releaseService.update(release._id, release)
                  )
              )
            )
          )
        ),
        tap(() => this.lazyLoad())
      )
      .subscribe();
  }

  deleteFilm(item: FilmDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć film „${item.title}”?`,
      header: 'Usuń film',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.filmService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto film „${item.title}”`,
              life: 3000,
            });
          });
      },
    });
  }

  private isCreateDto(dto: CreateReleaseDto | UpdateReleaseDto): dto is CreateReleaseDto {
    return !(dto as UpdateDistributorDto)._id;
  }
}
