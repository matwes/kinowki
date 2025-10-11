import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { debounceTime, filter, forkJoin, map, shareReplay, Subject, switchMap, tap } from 'rxjs';

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
    ShowIfAdminDirective,
    TableModule,
    TagModule,
    ToastModule,
  ],
  providers: [ConfirmationService, DialogService, MessageService],
})
export class FilmsComponent {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly filmService = inject(FilmService);
  private readonly distributorService = inject(DistributorService);
  private readonly releaseService = inject(ReleaseService);

  genres = genres;
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  data$ = this.lazyEvent.pipe(
    debounceTime(500),
    switchMap((lazyEvent) => this.filmService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));
  private distributors: DistributorDto[] = [];

  constructor() {
    this.distributorService.getAll().subscribe((res) => (this.distributors = res.data));
  }

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  openFilmDialog(item?: FilmDto) {
    this.dialogService
      .open(FilmDialogComponent, {
        data: { item, distributors: this.distributors },
        header: item ? 'Edytuj film' : 'Dodaj film',
        width: '90%',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(
        untilDestroyed(this),
        filter(notEmpty),
        switchMap((data) => {
          const releases = data.releases as (CreateReleaseDto | UpdateReleaseDto)[];
          const filmRequest = item ? this.filmService.update(item._id, data) : this.filmService.create(data);

          return filmRequest.pipe(
            switchMap((res) => {
              const film = res.data;
              return forkJoin(
                releases
                  .map((release) => ({ ...release, film: film._id }))
                  .map((release) => {
                    if (this.isCreateDto(release)) {
                      return this.releaseService.create({ ...release });
                    } else {
                      return this.releaseService.update(release._id, release);
                    }
                  })
              );
            })
          );
        }),
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
