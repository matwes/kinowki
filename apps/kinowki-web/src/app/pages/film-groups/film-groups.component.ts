import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { FilmGroupDto, genres } from '@kinowki/shared';
import { FilmGroupService } from '../../services';
import { notEmpty } from '../../utils';
import { FilmGroupDialogComponent } from './film-group-dialog';

@UntilDestroy()
@Component({
  selector: 'app-film-groups',
  templateUrl: './film-groups.component.html',
  styleUrl: './film-groups.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    FormsModule,
    InputTextModule,
    TableModule,
    ToastModule,
    ToolbarModule,
  ],
  providers: [ConfirmationService, DialogService],
})
export class FilmGroupsComponent {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly filmGroupService = inject(FilmGroupService);

  genres = genres;
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  data$ = this.lazyEvent.pipe(
    switchMap((lazyEvent) => this.filmGroupService.getAll(lazyEvent)),
    shareReplay(1)
  );

  value$ = this.data$.pipe(map((res) => res.data));
  totalRecords$ = this.data$.pipe(map((res) => res.totalRecords));

  lazyLoad(event?: TableLazyLoadEvent) {
    if (event) {
      this.event = event;
    }
    if (this.event) {
      this.lazyEvent.next(this.event);
    }
  }

  openFilmGroupDialog(item?: FilmGroupDto) {
    this.dialogService
      .open(FilmGroupDialogComponent, {
        data: { item },
        header: item ? 'Edytuj grupę' : 'Dodaj grupę',
        width: '40%',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(
        untilDestroyed(this),
        filter(notEmpty),
        switchMap((data) => (item ? this.filmGroupService.update(item._id, data) : this.filmGroupService.create(data))),
        tap(() => this.lazyLoad())
      )
      .subscribe();
  }

  deleteFilmGroup(item: FilmGroupDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć grupę „${item.name}”?`,
      header: 'Usuń grupę',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.filmGroupService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto grupę „${item.name}”`,
              life: 3000,
            });
          });
      },
    });
  }
}
