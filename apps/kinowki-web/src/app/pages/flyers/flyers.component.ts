import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { CreateReleaseDto, FlyerDto, TagDto, UpdateDistributorDto, UpdateReleaseDto, genres } from '@kinowki/shared';
import { FlyerService, TagService } from '../../services';
import { FlyerSizeNamePipe, FlyerTypeNamePipe, notEmpty } from '../../utils';
import { FlyerComponent } from '../flyer/flyer.component';
import { FlyerDialogComponent } from './flyer-dialog';

@UntilDestroy()
@Component({
  selector: 'app-flyers',
  templateUrl: './flyers.component.html',
  styleUrl: './flyers.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    FlyerComponent,
    FlyerSizeNamePipe,
    FlyerTypeNamePipe,
    FormsModule,
    ImageModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    TableModule,
    TagModule,
    ToastModule,
  ],
  providers: [ConfirmationService, DialogService, MessageService],
})
export class FlyersComponent {
  genres = genres;
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  data$ = this.lazyEvent.pipe(
    switchMap((lazyEvent) => this.flyerService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));
  private tags: TagDto[] = [];

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: DialogService,
    private readonly flyerService: FlyerService,
    private readonly tagService: TagService
  ) {
    this.tagService.getAll().subscribe((res) => (this.tags = res.data));
  }

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  openFlyerDialog(item?: FlyerDto) {
    this.dialogService
      .open(FlyerDialogComponent, {
        data: { item, tags: this.tags },
        header: item ? 'Edytuj ulotkę' : 'Dodaj ulotkę',
        width: '45%',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(
        untilDestroyed(this),
        filter(notEmpty),
        switchMap((data) => (item ? this.flyerService.update(item._id, data) : this.flyerService.create(data))),
        tap(() => this.lazyLoad())
      )
      .subscribe();
  }

  deleteFlyer(item: FlyerDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć ulotkę „${item.id}”?`,
      header: 'Usuń ulotke',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.flyerService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto ulotkę „${item.id}”`,
              life: 3000,
            });
          });
      },
    });
  }

  private isCreateDto(dto: CreateReleaseDto | UpdateReleaseDto): dto is CreateReleaseDto {
    return !(dto as UpdateDistributorDto)._id;
  }
}
