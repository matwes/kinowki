import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

import { DistributorDto, FilmDto, genreMap, genres, releaseTypes } from '@kinowki/shared';
import { letters } from '../letters';

@Component({
  selector: 'app-film-dialog',
  templateUrl: './film-dialog.component.html',
  styleUrl: './film-dialog.component.sass',
  imports: [
    ButtonModule,
    CheckboxModule,
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
  private readonly ref = inject(DynamicDialogRef);
  private readonly config: DynamicDialogConfig<{
    item: FilmDto;
    distributors: DistributorDto[];
  }> = inject(DynamicDialogConfig);
  private readonly fb = inject(NonNullableFormBuilder);

  options: {
    genres: { value: number; label: string }[];
    releaseTypes: { value: number; label: string }[];
    distributors: DistributorDto[];
  } = { genres, releaseTypes, distributors: [] };

  form = this.fb.group({
    title: [undefined as unknown as string, Validators.required],
    originalTitle: undefined as string | undefined,
    firstLetter: undefined as string | undefined,
    year: [undefined as unknown as number, Validators.required],
    genres: [[] as number[]],
    imdb: undefined as number | undefined,
    releases: this.fb.array(
      [] as FormGroup<{
        _id: FormControl<string | undefined>;
        date: FormControl<Date>;
        noDay: FormControl<boolean>;
        distributors: FormControl<string[]>;
        releaseType: FormControl<number>;
        note: FormControl<string | undefined>;
      }>[]
    ),
  });

  get title() {
    return this.form.controls.title;
  }

  get originalTitle() {
    return this.form.controls.originalTitle;
  }

  get firstLetter() {
    return this.form.controls.firstLetter;
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

  ngOnInit(): void {
    if (this.config.data) {
      this.options.distributors = this.config.data.distributors ?? [];
      const film = this.config.data.item;

      if (film) {
        this.title.setValue(film.title);
        this.originalTitle.setValue(film.originalTitle);
        this.firstLetter.setValue(film.firstLetter);
        this.year.setValue(film.year);
        this.genres.setValue(film.genres);
        this.imdb.setValue(film.imdb);

        film.releases?.forEach((release) => {
          const date = release.date.endsWith('-00') ? release.date.slice(0, -2) + '01' : release.date;

          this.releases.push(
            this.fb.group({
              _id: release._id,
              date: new Date(date),
              noDay: [release.date.endsWith('00')],
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
        date: undefined as unknown as Date,
        noDay: [false],
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
    const title = this.title.value.trim();
    const originalTitle = this.originalTitle.value?.trim();

    return {
      title,
      originalTitle,
      firstLetter: this.computeFirstLetter(title),
      year: this.year.value,
      genres: this.genres.value.sort((a, b) => genreMap[a].localeCompare(genreMap[b])),
      imdb: this.imdb.value,
    };
  }

  private getReleases() {
    return this.releases.controls
      .map((release) => {
        const date = new Date(release.controls.date.value);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = release.controls.noDay.value ? '00' : String(date.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        return {
          _id: release.controls._id.value || undefined,
          date: dateStr,
          distributors: release.controls.distributors.value,
          releaseType: release.controls.releaseType.value,
          note: release.controls.note.value,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private computeFirstLetter(title: string): string {
    if (!title) return '#';

    const firstChar = title.trim().charAt(0).toUpperCase();

    if (letters.includes(firstChar)) {
      return firstChar;
    }

    const normalized = firstChar
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace('Ł', 'Ł')
      .replace('Ś', 'Ś')
      .replace('Ź', 'Ź')
      .replace('Ż', 'Ż')
      .replace('Ó', 'Ó');

    if (letters.includes(normalized)) {
      return normalized;
    }
    
    return '#';
  }
}
