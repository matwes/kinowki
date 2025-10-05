import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../services';
import { LogoComponent } from '../logo';
import { HttpErrorResponse } from '@angular/common/http';

function passwordsMatchValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  };
}

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrl: './register-dialog.component.sass',
  imports: [ReactiveFormsModule, IftaLabelModule, ButtonModule, InputTextModule, LogoComponent, PasswordModule],
})
export class RegisterDialogComponent {
  private readonly ref = inject(DynamicDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  form = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/\d/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator() }
  );

  get name() {
    return this.form.controls.name;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  error = signal<string | undefined>(undefined);
  disableButton = signal(false);

  onSubmit() {
    this.disableButton.set(true);
    this.authService.register(this.email.value, this.password.value, this.name.value).subscribe({
      next: () => {
        this.error.set(undefined);
        this.ref.close({ registered: true });
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        if (err.status === 409) {
          this.error.set('Użytkownik o podanym adresie e-mail już istnieje');
        } else {
          this.error.set('Wystąpił błąd podczas rejestracji');
        }
        this.disableButton.set(false);
      },
    });
  }

  closeDialog() {
    this.ref.close();
  }
}
