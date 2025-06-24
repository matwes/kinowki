/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { filter } from 'rxjs';

import { GenreNamePipe, mockedFilms, notEmpty } from '../../utils';
import { FilmDialogComponent } from './film-dialog';

interface Film {
  _id?: string;
  title?: string;
  originalTitle?: string;
  year?: number;
  genres?: number[];
  description?: string;
  imdb?: number;
}

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
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    TagModule,
    ToastModule,
    ToolbarModule,
  ],
  providers: [MessageService, ConfirmationService, DialogService],
})
export class FilmsComponent {
  @ViewChild('dt') dt!: Table;

  films: Film[] = mockedFilms;

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: DialogService
  ) {}

  openFilmDialog(film?: Film) {
    this.dialogService
      .open(FilmDialogComponent, {
        data: { item: film },
        header: film ? 'Edytuj film' : 'Dodaj film',
        width: '30%',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(untilDestroyed(this), filter(notEmpty<any>))
      .subscribe();
  }

  deleteFilm(film: Film) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć film „${film.title}”?`,
      header: 'Usuń film',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sukces',
          detail: `Usunięto film „${film.title}”`,
          life: 3000,
        });
      },
    });
  }
}
