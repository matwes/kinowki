import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { DistributorDto, genres } from '@kinowki/shared';
import { DistributorService } from '../../services';
import { notEmpty } from '../../utils';
import { DistributorDialogComponent } from './distributor-dialog';

@UntilDestroy()
@Component({
  selector: 'app-distributors',
  templateUrl: './distributors.component.html',
  styleUrl: './distributors.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
  ],
  providers: [ConfirmationService, DialogService, MessageService],
})
export class DistributorsComponent {
  genres = genres;
  totalRecords = 0;
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  data$ = this.lazyEvent.pipe(
    switchMap((lazyEvent) => this.distributorService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: DialogService,
    private readonly distributorService: DistributorService
  ) {}

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  openDistributorDialog(item?: DistributorDto) {
    this.dialogService
      .open(DistributorDialogComponent, {
        data: { item },
        header: item ? 'Edytuj dystrybutora' : 'Dodaj dystrybutora',
        width: '40%',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(
        untilDestroyed(this),
        filter(notEmpty),
        switchMap((data) =>
          item ? this.distributorService.update(item._id, data) : this.distributorService.create(data)
        ),
        tap(() => this.lazyLoad())
      )
      .subscribe();
  }

  deleteDistributor(item: DistributorDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć dystrybutora „${item.name}”?`,
      header: 'Usuń dystrybutora',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.distributorService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto dystrybutora „${item.name}”`,
              life: 3000,
            });
          });
      },
    });
  }
}
