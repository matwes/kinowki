import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../services';
import { LogoComponent } from '../logo';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrl: './forgot-password-dialog.component.sass',
  imports: [ReactiveFormsModule, IftaLabelModule, ButtonModule, InputTextModule, LogoComponent, PasswordModule],
})
export class ForgotPasswordDialogComponent {
  private readonly ref = inject(DynamicDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  get email() {
    return this.form.controls.email;
  }

  error = signal<string | undefined>(undefined);
  disableButton = signal(false);

  onSubmit() {
    this.disableButton.set(true);
    this.authService.requestResetPassword(this.email.value.trim()).subscribe({
      next: () => {
        this.error.set(undefined);
        this.ref.close({ requestedResetPassword: true });
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error.set('Wystąpił błąd podczas resetowania hasła');
        this.disableButton.set(false);
      },
    });
  }

  closeDialog() {
    this.ref.close();
  }
}
