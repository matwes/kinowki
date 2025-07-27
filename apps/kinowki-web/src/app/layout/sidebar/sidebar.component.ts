import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.sass',
})
export class SidebarComponent {
  readonly pages = [
    { label: 'Filmy', url: '/filmy' },
    { label: 'Premiery', url: '/premiery' },
    { label: 'Ulotki', url: '/ulotki' },
    { label: 'Dystrybutorzy', url: '/dystrybutorzy' },
    { label: 'Tagi', url: '/tagi' },
  ];
}
