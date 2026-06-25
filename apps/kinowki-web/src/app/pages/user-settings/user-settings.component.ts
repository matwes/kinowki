import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { IftaLabelModule } from 'primeng/iftalabel';
import { UnmarkedFlyersService, UserService } from '../../services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { switchMap, tap } from 'rxjs';

type SaveState = 'idle' | 'saving' | 'saved';

@UntilDestroy()
@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.sass',
  imports: [
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    IftaLabelModule,
    InputTextModule,
    ReactiveFormsModule,
    ToggleSwitchModule,
  ],
  providers: [ConfirmationService],
})
export class UserSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly unmarkedFlyersService = inject(UnmarkedFlyersService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    email: [{ value: '', disabled: true }],
    city: ['', [Validators.maxLength(50)]],
  });

  readonly saveState = signal<SaveState>('idle');
  readonly unmarkedFlyersTotal = signal(0);
  readonly markingAll = signal(false);

  constructor() {
    this.userService
      .getMe()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res) {
          this.form.controls.name.setValue(res.data.name);
          this.form.controls.email.setValue(res.data.email);
          this.form.controls.city.setValue(res.data.city);
        }
      });

    this.updateUnmarkedFlyersTotal().subscribe();
  }

  save(): void {
    if (this.form.invalid || this.saveState() === 'saving') {
      this.form.markAllAsTouched();
    } else {
      this.saveState.set('saving');

      this.userService
        .updateMe({
          name: this.form.controls.name.value,
          city: this.form.controls.city.value,
        })
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.form.markAsPristine();
          this.saveState.set('saved');

          setTimeout(() => this.saveState.set('idle'), 5000);
        });
    }
  }

  confirmMarkAllAsWanted(): void {
    if (this.markingAll()) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Oznaczyć wszystkie nieoznaczone ulotki?',
      message: `Status ${this.unmarkedFlyersTotal()} ulotek zostanie zmieniony na „szukam”. Ta operacja jest nieodwracalna i nie będzie można jej cofnąć.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oznacz wszystkie',
      rejectLabel: 'Anuluj',
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.markAllAsWanted(),
    });
  }

  private markAllAsWanted(): void {
    this.unmarkedFlyersService
      .markAsWanted()
      .pipe(
        untilDestroyed(this),
        switchMap(() => this.updateUnmarkedFlyersTotal())
      )
      .subscribe(() => this.markingAll.set(false));
  }

  private updateUnmarkedFlyersTotal() {
    return this.unmarkedFlyersService.getTotal().pipe(
      untilDestroyed(this),
      tap((res) => this.unmarkedFlyersTotal.set(res.data ?? 0))
    );
  }
}
