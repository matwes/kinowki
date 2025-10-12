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
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { map, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { months, ReleaseDto } from '@kinowki/shared';
import { ReleaseService } from '../../services';
import { DistributorBadgeComponent, ImdbPipe, ReleaseDatePipe, ShowIfAdminDirective } from '../../utils';
import { FlyerComponent } from '../flyer';

const FIRST_YEAR = 1990;
const LAST_YEAR = new Date().getFullYear() + 1;

@UntilDestroy()
@Component({
  selector: 'app-releases',
  templateUrl: './releases.component.html',
  styleUrl: './releases.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    DistributorBadgeComponent,
    FlyerComponent,
    FormsModule,
    ImdbPipe,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    ReleaseDatePipe,
    SelectButtonModule,
    SelectModule,
    ShowIfAdminDirective,
    TableModule,
    ToastModule,
    ToolbarModule,
  ],
  providers: [ConfirmationService, DialogService, ReleaseService, MessageService],
})
export class ReleasesComponent {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly releaseService = inject(ReleaseService);
  private readonly fb = inject(NonNullableFormBuilder);

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
    selectMonth: new Date().getMonth(),
    selectButtonMonth: new Date().getMonth(),
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

  get selectMonth() {
    return this.form.controls.selectMonth;
  }

  get selectButtonMonth() {
    return this.form.controls.selectButtonMonth;
  }

  today = this.getToday();

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
      this.selectMonth.setValue((filters['month'] as FilterMetadata).value);
      this.selectButtonMonth.setValue((filters['month'] as FilterMetadata).value);
    } else {
      table.filter(this.selectMonth.value, 'month', '');
    }
    if (filters['year']) {
      this.year.setValue((filters['year'] as FilterMetadata).value);
    } else {
      table.filter(this.year.value, 'year', '');
    }

    this.year.valueChanges.pipe(untilDestroyed(this)).subscribe((year) => table.filter(year, 'year', ''));

    this.selectMonth.valueChanges.pipe(untilDestroyed(this)).subscribe((month) => {
      table.filter(month, 'month', '');
      this.selectButtonMonth.setValue(month, { emitEvent: false });
    });

    this.selectButtonMonth.valueChanges.pipe(untilDestroyed(this)).subscribe((month) => {
      table.filter(month, 'month', '');
      this.selectMonth.setValue(month, { emitEvent: false });
    });
  }

  getToday() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
