import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { of, switchMap } from 'rxjs';

import { AuthService } from '../../services';
import { LoginDialogComponent } from '../login-dialog';
import { LogoComponent } from '../logo';
import { RegisterDialogComponent } from '../register-dialog';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, CommonModule, DrawerModule, RouterModule, LogoComponent, ToastModule, MenuModule],
  providers: [DialogService, MessageService],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.sass',
})
export class SidebarComponent {
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  protected readonly authService = inject(AuthService);

  readonly pages = [
    { label: 'Ulotki', url: '/ulotki', icon: PrimeIcons.TH_LARGE },
    { label: 'Filmy', url: '/filmy', icon: PrimeIcons.VIDEO },
    { label: 'Premiery', url: '/premiery', icon: PrimeIcons.CALENDAR },
    { label: 'Dystrybutorzy', url: '/dystrybutorzy', icon: PrimeIcons.BOOK },
    ...(this.authService.isAdmin() ? [{ label: 'Tagi', url: '/tagi', icon: PrimeIcons.TAG }] : []),
    { label: 'Kontakt', url: '/kontakt', icon: PrimeIcons.INFO_CIRCLE },
  ];

  readonly items: MenuItem[] = [
    {
      label: 'Wyloguj',
      icon: PrimeIcons.SIGN_OUT,
      command: () => this.logout(),
    },
  ];

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
            severity: 'info',
            summary: 'Utworzono konto',
            detail: 'Na podany e-mail wysłano link aktywacyjny',
            life: 3000,
          });
        }
      });
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
