import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { of, switchMap } from 'rxjs';

import { AuthService, FlyerService } from '../../services';
import { LoginDialogComponent } from '../login-dialog';
import { LogoComponent } from '../logo';
import { RegisterDialogComponent } from '../register-dialog';

@UntilDestroy()
@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, CommonModule, DrawerModule, LogoComponent, MenuModule, RouterModule, ToastModule],
  providers: [DialogService, MessageService],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.sass',
})
export class SidebarComponent {
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly flyerService = inject(FlyerService);
  protected readonly authService = inject(AuthService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  pages = computed(() => [
    { label: 'Ulotki', url: '/ulotki', icon: PrimeIcons.TH_LARGE },
    { label: 'Filmy', url: '/filmy', icon: PrimeIcons.VIDEO },
    { label: 'Premiery', url: '/premiery', icon: PrimeIcons.CALENDAR },
    { label: 'Dystrybutorzy', url: '/dystrybutorzy', icon: PrimeIcons.BOOK },
    ...(this.authService.isAdmin() ? [{ label: 'Tagi', url: '/tagi', icon: PrimeIcons.TAG }] : []),
    { label: 'Kontakt', url: '/kontakt', icon: PrimeIcons.INFO_CIRCLE },
  ]);

  items = computed<MenuItem[]>(() => [
    ...(this.authService.importUsed()
      ? []
      : [{ label: 'Importuj z .xlsx (tylko raz)', icon: PrimeIcons.FILE_IMPORT, command: () => this.import() }]),
    { label: 'Wyloguj', icon: PrimeIcons.SIGN_OUT, command: () => this.logout() },
  ]);

  showDrawer = false;

  openLoginDialog() {
    this.showDrawer = false;

    const dialogOptions: DynamicDialogConfig = {
      modal: true,
      width: '25vw',
      breakpoints: {
        '1400px': '40vw',
        '960px': '75vw',
        '640px': '90vw',
      },
    };

    this.dialogService
      .open(LoginDialogComponent, dialogOptions)
      .onClose.pipe(
        untilDestroyed(this),
        switchMap((data) => {
          if (data?.register) {
            return this.dialogService.open(RegisterDialogComponent, dialogOptions).onClose;
          } else {
            return of(null);
          }
        })
      )
      .subscribe((data) => {
        if (data?.registered) {
          this.messageService.add({
            severity: 'success',
            summary: 'Utworzono konto',
            detail: 'Na podany e-mail wysłano link aktywacyjny',
            life: 3000,
          });
        } else {
          window.location.reload();
        }
      });
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }

  import() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    input.value = '';

    this.flyerService
      .importUserFlyers(file)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (event) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sukces',
            detail: `Zaimportowano ${event.data} rekordów`,
            life: 3000,
          });
          setTimeout(() => window.location.reload(), 3000);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Wystąpił problem podczas importowania pliku.',
            life: 3000,
          });
        },
      });
  }
}
