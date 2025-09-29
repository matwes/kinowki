import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, CommonModule, DrawerModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.sass',
})
export class SidebarComponent {
  readonly pages = [
    { label: 'Ulotki', url: '/ulotki', icon: PrimeIcons.TH_LARGE },
    { label: 'Filmy', url: '/filmy', icon: PrimeIcons.VIDEO },
    { label: 'Premiery', url: '/premiery', icon: PrimeIcons.CALENDAR },
    { label: 'Dystrybutorzy', url: '/dystrybutorzy', icon: PrimeIcons.BOOK },
    { label: 'Tagi', url: '/tagi', icon: PrimeIcons.TAG },
    { label: 'Kontakt', url: '/kontakt', icon: PrimeIcons.INFO_CIRCLE },
  ];

  showDrawer = false;
}
