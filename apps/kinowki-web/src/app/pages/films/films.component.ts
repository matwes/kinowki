import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
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
import { debounceTime, filter, forkJoin, map, of, shareReplay, Subject, switchMap, tap } from 'rxjs';

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
export class FilmsComponent {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly filmService = inject(FilmService);
  private readonly distributorService = inject(DistributorService);
  private readonly releaseService = inject(ReleaseService);
  private readonly fb = inject(NonNullableFormBuilder);

  @ViewChild(Table, { static: true }) set primengTable(table: Table) {
    setTimeout(() => this.subscribeToSearchForm(table));
  }

  genres = genres;
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  readonly letters = ['#', ...letters];

  searchForm = this.fb.group({
    selectButtonLetter: 'A' as string | null,
    selectLetter: 'A' as string | null,
  });

  get selectButtonLetter() {
    return this.searchForm.controls.selectButtonLetter;
  }

  get selectLetter() {
    return this.searchForm.controls.selectLetter;
  }

  data$ = this.lazyEvent.pipe(
    debounceTime(500),
    switchMap((lazyEvent) => this.filmService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));
  private distributors?: DistributorDto[];

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
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

  private subscribeToSearchForm(table: Table) {
    const filters = table.filters;
    if (filters['letter']) {
      this.selectButtonLetter.setValue((filters['letter'] as FilterMetadata).value);
      this.selectLetter.setValue((filters['letter'] as FilterMetadata).value);
    } else {
      table.filter(this.selectLetter.value, 'letter', '');
    }

    this.selectLetter.valueChanges.pipe(untilDestroyed(this)).subscribe((search) => {
      table.filter(search, 'letter', '');
      this.selectButtonLetter.setValue(search, { emitEvent: false });
    });

    this.selectButtonLetter.valueChanges.pipe(untilDestroyed(this)).subscribe((search) => {
      table.filter(search, 'letter', '');
      this.selectLetter.setValue(search, { emitEvent: false });
    });
  }

  private isCreateDto(dto: CreateReleaseDto | UpdateReleaseDto): dto is CreateReleaseDto {
    return !(dto as UpdateDistributorDto)._id;
  }
}
