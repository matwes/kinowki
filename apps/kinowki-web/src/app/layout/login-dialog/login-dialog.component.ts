import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../services';
import { LogoComponent } from '../logo';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.sass',
  imports: [ReactiveFormsModule, IftaLabelModule, ButtonModule, InputTextModule, LogoComponent, PasswordModule],
})
export class LoginDialogComponent {
  private readonly ref = inject(DynamicDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  form = this.fb.group({
    email: '',
    password: '',
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  error = signal<string | undefined>(undefined);

  onSubmit() {
    this.authService.login(this.email.value, this.password.value).subscribe({
      next: () => {
        this.error.set(undefined);
        this.ref.close();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        if (err.status === 401) {
          this.error.set('Niepoprawny e-mail lub hasło');
        } else {
          this.error.set('Wystąpił błąd podczas logowania');
        }
      },
    });
  }

  register() {
    this.ref.close({ register: true });
  }

  closeDialog() {
    this.ref.close();
  }
}
