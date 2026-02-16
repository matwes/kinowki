import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
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

import {
  FlyerDto,
  ReleaseDto,
  TagDto,
  UpdateFlyerDto,
  flyerKinds,
  flyerSizeMap,
  flyerSizes,
  flyerTypeMap,
  flyerTypes,
  releaseTypeMap,
} from '@kinowki/shared';
import { ReleaseService } from '../../../services';

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
    flyerKinds: { value: number; label: string }[];
    flyerSizes: { value: number; label: string }[];
    flyerTypes: { value: number; label: string }[];
    tags: TagDto[];
  } = { flyerKinds, flyerSizes, flyerTypes, tags: [] };

  releaseSearch = new BehaviorSubject<string>('');
  releases$: Nullable<Observable<ReleaseDto[]>>;
  private releaseMap = new Map<string, ReleaseDto>();

  form = this.fb.group({
    sortName: undefined as unknown as string,
    sortDate: undefined as unknown as string,
    filterName: undefined as unknown as string,
    releases: [[] as string[]],
    kind: 1,
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

  get sortName() {
    return this.form.controls.sortName;
  }

  get sortDate() {
    return this.form.controls.sortDate;
  }

  get filterName() {
    return this.form.controls.filterName;
  }

  get releases() {
    return this.form.controls.releases;
  }

  get kind() {
    return this.form.controls.kind;
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
        this.sortDate.setValue(flyer.sortDate);
        this.sortName.setValue(flyer.sortName);
        this.filterName.setValue(flyer.filterName);
        this.releases.setValue(flyer.releases.map((release) => release._id));
        this.kind.setValue(flyer.kind);
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
  }

  refresh() {
    this.sortDate.setValue(this.generateSortDate());
    this.sortName.setValue(this.generateSortName());
    this.filterName.setValue(this.generateFilterName());
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

  private generateFilterName(): string {
    return [
      ...this.releases.value
        .map((releaseId) => this.releaseMap.get(releaseId))
        .filter((release) => !!release)
        .flatMap((release) => [release.film?.title, release.film?.originalTitle, release.note]),
      this.note.value,
    ]
      .filter(Boolean)
      .join(';');
  }

  private generateSortName(): string {
    const releases = this.releases.value
      .map((releaseId) => this.releaseMap.get(releaseId))
      .filter((release) => !!release);

    if (!releases.length) {
      return '';
    }

    const oldestRelease = releases.reduce((oldest, current) => (current.date < oldest.date ? current : oldest));

    let name = `${releases.map((release) => release.film.title).join(' | ')}`;

    const tags = [
      ...(oldestRelease.releaseType !== 1 && oldestRelease.releaseType !== 5
        ? [releaseTypeMap[oldestRelease.releaseType]]
        : []),
      ...(oldestRelease.note ? [oldestRelease.note] : []),
      ...(!this.size.value || this.size.value === 1 ? [] : [flyerSizeMap[this.size.value]]),
      ...(!this.type.value || this.type.value === 1 || this.type.value === 14 ? [] : [flyerTypeMap[this.type.value]]),
      ...(this.note.value ? [this.note.value] : []),
    ];

    if (tags.length) {
      name += ` [${tags.join('] [')}]`;
    }

    return name;
  }

  private generateSortDate(): string {
    const ids = this.releases.value;

    if (ids.length) {
      const releases = ids.map((id) => this.releaseMap.get(id)).filter((release) => !!release);

      if (releases.length) {
        const oldestRelease = releases.reduce((oldest, current) => (current.date < oldest.date ? current : oldest));
        return oldestRelease.date;
      }
    }

    return '';
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
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
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
    this.note.setValue(`${this.note.value} • `);
  }

  private getFromForm(): Partial<UpdateFlyerDto> {
    return {
      sortDate: this.sortDate.value,
      sortName: this.sortName.value,
      filterName: this.filterName.value,
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
      kind: this.kind.value,
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
