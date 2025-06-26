import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

import { FilmDto, genreMap, genres } from '@kinowki/shared';

@Component({
  selector: 'app-film-dialog',
  templateUrl: './film-dialog.component.html',
  styleUrl: './film-dialog.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    IftaLabelModule,
    InputNumberModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
  ],
})
export class FilmDialogComponent implements OnInit {
  options = { genres };

  form = this.fb.group({
    _id: [{ value: undefined as unknown as string, disabled: true }],
    title: [undefined as unknown as string, Validators.required],
    originalTitle: undefined as string | undefined,
    year: [undefined as unknown as number, Validators.required],
    genres: [[] as number[]],
    imdb: undefined as number | undefined,
  });

  get _id() {
    return this.form.controls._id;
  }

  get title() {
    return this.form.controls.title;
  }

  get originalTitle() {
    return this.form.controls.originalTitle;
  }

  get year() {
    return this.form.controls.year;
  }

  get genres() {
    return this.form.controls.genres;
  }

  get imdb() {
    return this.form.controls.imdb;
  }

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig<{ item: FilmDto }>,
    private readonly fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {
    if (this.config.data) {
      const film = this.config.data.item;

      if (film) {
        this._id.setValue(film._id);
        this.title.setValue(film.title);
        this.originalTitle.setValue(film.originalTitle);
        this.year.setValue(film.year);
        this.genres.setValue(film.genres);
        this.imdb.setValue(film.imdb);
      }
    }
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    if (this.form.valid) {
      this.ref.close(this.getFromForm());
    } else {
      this.form.markAllAsTouched();
    }
  }

  private getFromForm(): Partial<FilmDto> {
    return {
      _id: this._id.value,
      title: this.title.value,
      originalTitle: this.originalTitle.value,
      year: this.year.value,
      genres: this.genres.value.sort((a, b) => genreMap[a].localeCompare(genreMap[b])),
      imdb: this.imdb.value,
    };
  }
}
