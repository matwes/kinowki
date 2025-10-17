import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../services';
import { passwordsMatchValidator } from '../../utils';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.sass',
  imports: [ReactiveFormsModule, IftaLabelModule, PasswordModule, ButtonModule, ToastModule],
  providers: [MessageService],
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/\d/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator() }
  );

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  error = signal<string | undefined>(undefined);
  disableButton = signal(false);
  private token: string | null = null;

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error.set('Brakuje tokena do resetu hasła.');
      this.form.disable();
      this.disableButton.set(true);
    }
  }

  onSubmit() {
    if (this.token) {
      this.disableButton.set(true);
      this.authService.resetPassword(this.token, this.password.value).subscribe({
        next: () => {
          this.error.set(undefined);

          this.messageService.add({
            severity: 'success',
            summary: 'Sukces',
            detail: 'Hasło zostało zmienione!',
            life: 3000,
          });
          setTimeout(() => this.router.navigate(['/ulotki']), 3000);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Wystąpił problem podczas resetowania hasła.',
            life: 3000,
          });
          this.disableButton.set(false);
        },
      });
    }
  }
}
