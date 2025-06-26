import { Component } from '@angular/core';
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
import { ToolbarModule } from 'primeng/toolbar';
import { filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { FilmDto, genres } from '@kinowki/shared';
import { FilmService } from '../../services';
import { GenreNamePipe, notEmpty } from '../../utils';
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
    FormsModule,
    GenreNamePipe,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    TableModule,
    TagModule,
    ToastModule,
    ToolbarModule,
  ],
  providers: [ConfirmationService, DialogService, FilmService, MessageService],
})
export class FilmsComponent {
  genres = genres;
  films: FilmDto[] = [];
  totalRecords = 0;
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  data$ = this.lazyEvent.pipe(
    switchMap((lazyEvent) => this.filmService.getAll(lazyEvent)),
    shareReplay(1)
  );

  films$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: DialogService,
    private readonly filmService: FilmService
  ) {}

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  openFilmDialog(film?: FilmDto) {
    this.dialogService
      .open(FilmDialogComponent, {
        data: { item: film },
        header: film ? 'Edytuj film' : 'Dodaj film',
        width: '30%',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(
        untilDestroyed(this),
        filter(notEmpty),
        switchMap((data) => (film ? this.filmService.update(film._id, data) : this.filmService.create(data))),
        tap(() => this.lazyLoad())
      )
      .subscribe();
  }

  deleteFilm(film: FilmDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć film „${film.title}”?`,
      header: 'Usuń film',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.filmService
          .delete(film._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto film „${film.title}”`,
              life: 3000,
            });
          });
      },
    });
  }
}
