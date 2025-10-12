import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Nullable } from 'primeng/ts-helpers';
import { BehaviorSubject, debounceTime, filter, map, Observable, scan, startWith, switchMap } from 'rxjs';

import { FlyerDto, flyerSizes, flyerTypes, ReleaseDto, TagDto, UpdateFlyerDto } from '@kinowki/shared';
import { ReleaseService } from '../../../services';

@UntilDestroy()
@Component({
  selector: 'app-flyer-dialog',
  templateUrl: './flyer-dialog.component.html',
  styleUrl: './flyer-dialog.component.sass',
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
export class FlyerDialogComponent implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config: DynamicDialogConfig<{
    item: FlyerDto;
    tags: TagDto[];
  }> = inject(DynamicDialogConfig);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly releaseService = inject(ReleaseService);

  options: {
    flyerSizes: { value: number; label: string }[];
    flyerTypes: { value: number; label: string }[];
    tags: TagDto[];
  } = { flyerSizes, flyerTypes, tags: [] };

  releaseSearch = new BehaviorSubject<string>('');
  releases$: Nullable<Observable<ReleaseDto[]>>;
  private releaseMap = new Map<string, ReleaseDto>();

  form = this.fb.group({
    id: undefined as unknown as string,
    releases: [[] as string[]],
    type: 1 as number | undefined,
    size: 1 as number | undefined,
    tags: [[] as string[]],
    note: undefined as string | undefined,
    images: this.fb.array(
      [] as FormGroup<{
        original: FormControl<string>;
        thumbnail: FormControl<string | undefined>;
      }>[]
    ),
  });

  get id() {
    return this.form.controls.id;
  }

  get releases() {
    return this.form.controls.releases;
  }

  get type() {
    return this.form.controls.type;
  }

  get size() {
    return this.form.controls.size;
  }

  get tags() {
    return this.form.controls.tags;
  }

  get note() {
    return this.form.controls.note;
  }

  get images() {
    return this.form.controls.images;
  }

  ngOnInit(): void {
    let initialReleases: ReleaseDto[] = [];

    if (this.config.data) {
      this.options.tags = this.config.data.tags ?? [];
      const flyer = this.config.data.item;

      if (flyer) {
        this.id.setValue(flyer.id);
        this.releases.setValue(flyer.releases.map((release) => release._id));
        this.type.setValue(flyer.type);
        this.size.setValue(flyer.size);
        this.tags.setValue(flyer.tags.map((tag) => tag._id));
        this.note.setValue(flyer.note);

        flyer.images?.forEach((image) => {
          this.images.push(
            this.fb.group({
              original: image.original,
              thumbnail: image.thumbnail,
            })
          );
        });

        initialReleases = [...flyer.releases];
      }
    }

    this.releases$ = this.releaseSearch.pipe(
      filter((search) => !!search),
      debounceTime(300),
      switchMap((search) => this.releaseService.getAll({ filters: { film: { value: search } } })),
      map((res) => res.data),
      startWith(initialReleases),
      scan((releases, newReleases) => {
        const allReleases = [...releases, ...newReleases];
        const uniqueReleasesMap = new Map<string, ReleaseDto>();

        for (const release of allReleases) {
          uniqueReleasesMap.set(release._id, release);
          this.releaseMap.set(release._id, release);
        }

        return Array.from(uniqueReleasesMap.values());
      }, [] as ReleaseDto[])
    );

    this.releases.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.id.setValue(this.generateFlyerId()));
  }

  addImage() {
    const link = this.generateFlyerLink();

    this.images.push(
      this.fb.group({
        original: `${link}-Ulotka-1.jpg`,
        thumbnail: `${link}-Ulotka-1th.jpg` as string | undefined,
      })
    );

    this.images.push(
      this.fb.group({
        original: `${link}-Ulotka-2.jpg`,
        thumbnail: `${link}-Ulotka-2th.jpg` as string | undefined,
      })
    );
  }

  private generateFlyerId(): string {
    let result = '';
    const ids = this.releases.value;

    if (ids.length) {
      const releases = ids.map((id) => this.releaseMap.get(id)).filter((release) => !!release);

      if (releases.length) {
        if (releases.length === 1) {
          const release = releases[0];
          result = `${release.date}${release.film.year}${release.film.title}${release.film.originalTitle ?? ''}`;
        } else {
          const oldestRelease = releases.reduce((oldest, current) => (current.date < oldest.date ? current : oldest));
          result = `${oldestRelease.date}${oldestRelease.film.year}${releases
            .map((release) => release.film.title)
            .join(' | ')}`;
        }
      }
    }

    return result;
  }

  private generateFlyerLink(): string {
    let result = '';
    const ids = this.releases.value;

    if (ids.length) {
      const releases = ids.map((id) => this.releaseMap.get(id)).filter((release) => !!release);

      if (releases.length) {
        const oldestDate = releases.reduce((oldest, current) => (current.date < oldest.date ? current : oldest)).date;

        const [year, month] = oldestDate.split('-');

        const titles = releases.map((release) => this.normalizeTitle(release.film.title)).join('-');

        result = `/${year}/${month}/${titles}`;
      }
    }

    return result;
  }

  private normalizeTitle(title: string): string {
    if (!title) {
      return '';
    }

    const charMap: Record<string, string> = {
      ł: 'l',
      Ł: 'L',
      ą: 'a',
      Ą: 'A',
      ę: 'e',
      Ę: 'E',
      ś: 's',
      Ś: 'S',
      ć: 'c',
      Ć: 'C',
      ń: 'n',
      Ń: 'N',
      ó: 'o',
      Ó: 'O',
      ż: 'z',
      Ż: 'Z',
      ź: 'z',
      Ź: 'Z',
    };

    return Array.from(title)
      .map((ch) => charMap[ch] ?? ch)
      .join('')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s-]+/gu, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('-');
  }

  deleteRelease(idx: number) {
    this.images.removeAt(idx);
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

  addSeparator() {
    this.note.setValue(this.note.value + ' • ');
  }

  private getFromForm(): Partial<UpdateFlyerDto> {
    return {
      id: this.id.value,
      releases: this.releases.value.sort((a, b) => {
        const releaseA = this.releaseMap.get(a);
        const releaseB = this.releaseMap.get(b);

        if (!releaseA || !releaseB) {
          return 0;
        }

        if (releaseA.date !== releaseB.date) {
          return releaseA.date.localeCompare(releaseB.date);
        }

        return releaseA.film.title.localeCompare(releaseB.film.title);
      }),
      type: this.type.value,
      size: this.size.value,
      tags: this.tags.value,
      note: this.note.value,
      images: this.images.controls.map((image) => ({
        original: image.controls.original.value,
        thumbnail: image.controls.thumbnail.value,
      })),
    };
  }
}
