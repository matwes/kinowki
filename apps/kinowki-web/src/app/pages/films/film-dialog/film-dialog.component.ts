import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

import { DistributorDto, FilmDto, genreMap, genres, releaseTypes } from '@kinowki/shared';

@Component({
  selector: 'app-film-dialog',
  templateUrl: './film-dialog.component.html',
  styleUrl: './film-dialog.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    DatePickerModule,
    IftaLabelModule,
    InputNumberModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    SelectModule,
  ],
})
export class FilmDialogComponent implements OnInit {
  options: {
    genres: { value: number; label: string }[];
    releaseTypes: { value: number; label: string }[];
    distributors: DistributorDto[];
  } = { genres, releaseTypes, distributors: [] };

  form = this.fb.group({
    _id: [{ value: undefined as unknown as string, disabled: true }],
    title: [undefined as unknown as string, Validators.required],
    originalTitle: undefined as string | undefined,
    year: [undefined as unknown as number, Validators.required],
    genres: [[] as number[]],
    imdb: undefined as number | undefined,
    releases: this.fb.array(
      [] as FormGroup<{
        _id: FormControl<string | undefined>;
        date: FormControl<Date>;
        distributors: FormControl<string[]>;
        releaseType: FormControl<number>;
        note: FormControl<string | undefined>;
      }>[]
    ),
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

  get releases() {
    return this.form.controls.releases;
  }

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig<{ item: FilmDto; distributors: DistributorDto[] }>,
    private readonly fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {
    if (this.config.data) {
      this.options.distributors = this.config.data.distributors ?? [];
      const film = this.config.data.item;

      if (film) {
        this._id.setValue(film._id);
        this.title.setValue(film.title);
        this.originalTitle.setValue(film.originalTitle);
        this.year.setValue(film.year);
        this.genres.setValue(film.genres);
        this.imdb.setValue(film.imdb);

        film.releases?.forEach((release) => {
          this.releases.push(
            this.fb.group({
              _id: release._id,
              date: new Date(release.date),
              distributors: [release.distributors.map((d) => d._id)],
              releaseType: release.releaseType,
              note: release.note,
            })
          );
        });
      }
    }
  }

  addRelease() {
    this.releases.push(
      this.fb.group({
        _id: undefined as string | undefined,
        date: new Date(),
        distributors: [[] as string[]],
        releaseType: 1,
        note: '' as string | undefined,
      })
    );
  }

  deleteRelease(idx: number) {
    this.releases.removeAt(idx);
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    if (this.form.valid) {
      this.ref.close({
        ...this.getFromForm(),
        releases: this.getReleases(),
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  private getFromForm(): Partial<FilmDto> {
    return {
      _id: this._id.value,
      title: this.title.value.trim(),
      originalTitle: this.originalTitle.value?.trim(),
      year: this.year.value,
      genres: this.genres.value.sort((a, b) => genreMap[a].localeCompare(genreMap[b])),
      imdb: this.imdb.value,
    };
  }

  private getReleases() {
    return this.releases.controls.map((release) => {
      return {
        _id: release.controls._id.value || undefined,
        date: release.controls.date.value,
        distributors: release.controls.distributors.value,
        releaseType: release.controls.releaseType.value,
        note: release.controls.note.value,
      };
    });
  }
}
