import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, FilterMetadata, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { map, shareReplay, startWith, Subject, switchMap, tap } from 'rxjs';

import { months, ReleaseDto } from '@kinowki/shared';
import { ReleaseService } from '../../services';
import { ReleaseTypeNamePipe } from '../../utils';

const FIRST_YEAR = 1990;
const LAST_YEAR = 2025;

@UntilDestroy()
@Component({
  selector: 'app-releases',
  templateUrl: './releases.component.html',
  styleUrl: './releases.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    FormsModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    ReleaseTypeNamePipe,
    SelectButtonModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    ToolbarModule,
  ],
  providers: [ConfirmationService, DialogService, ReleaseService, MessageService],
})
export class ReleasesComponent {
  @ViewChild(Table, { static: true }) set primengTable(table: Table) {
    setTimeout(() => this.subscribeToSearchForm(table));
  }

  options = {
    years: Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => LAST_YEAR - i),
    months,
  };
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  form = this.fb.group({
    year: 2025,
    month: new Date().getMonth(),
  });

  data$ = this.lazyEvent.pipe(
    switchMap((lazyEvent) => this.releaseService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));

  get year() {
    return this.form.controls.year;
  }

  get month() {
    return this.form.controls.month;
  }

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly releaseService: ReleaseService,
    private readonly fb: NonNullableFormBuilder
  ) {
    this.form.valueChanges.pipe(startWith(this.form));
  }

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  deleteRelease(item: ReleaseDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć premierę „${item.date}”?`,
      header: 'Usuń premirę',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.releaseService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto premierę „${item.date}”`,
              life: 3000,
            });
          });
      },
    });
  }

  private subscribeToSearchForm(table: Table) {
    const filters = table.filters;
    if (filters['month']) {
      this.month.setValue((filters['month'] as FilterMetadata).value);
    }
    if (filters['year']) {
      this.year.setValue((filters['year'] as FilterMetadata).value);
    }

    this.form.valueChanges.pipe(untilDestroyed(this)).subscribe((search) => {
      table.filter(search.month, 'month', '');
      table.filter(search.year, 'year', '');
    });
  }
}
