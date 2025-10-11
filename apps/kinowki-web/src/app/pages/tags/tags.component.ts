import { Component, inject } from '@angular/core';
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
import { ToolbarModule } from 'primeng/toolbar';
import { filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';

import { TagDto, genres } from '@kinowki/shared';
import { TagService } from '../../services';
import { notEmpty } from '../../utils';
import { TagDialogComponent } from './tag-dialog';

@UntilDestroy()
@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    ToolbarModule,
  ],
  providers: [ConfirmationService, DialogService, MessageService],
})
export class TagsComponent {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly tagService = inject(TagService);

  genres = genres;
  event?: TableLazyLoadEvent;
  lazyEvent = new Subject<TableLazyLoadEvent>();

  data$ = this.lazyEvent.pipe(
    switchMap((lazyEvent) => this.tagService.getAll(lazyEvent)),
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

  openTagDialog(item?: TagDto) {
    this.dialogService
      .open(TagDialogComponent, {
        data: { item },
        header: item ? 'Edytuj tag' : 'Dodaj tag',
        width: '40%',
        closeOnEscape: false,
        modal: true,
      })
      .onClose.pipe(
        untilDestroyed(this),
        filter(notEmpty),
        switchMap((data) => (item ? this.tagService.update(item._id, data) : this.tagService.create(data))),
        tap(() => this.lazyLoad())
      )
      .subscribe();
  }

  deleteTag(item: TagDto) {
    this.confirmationService.confirm({
      message: `Czy na pewno chcesz usunąć tag „${item.name}”?`,
      header: 'Usuń tag',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tagService
          .delete(item._id)
          .pipe(
            untilDestroyed(this),
            tap(() => this.lazyLoad())
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sukces',
              detail: `Usunięto tag „${item.name}”`,
              life: 3000,
            });
          });
      },
    });
  }
}
