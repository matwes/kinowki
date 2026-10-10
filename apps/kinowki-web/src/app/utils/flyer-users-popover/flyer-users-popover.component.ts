import { Component, ViewChild, input } from '@angular/core';
import { FlyerDto } from '@kinowki/shared';
import { Popover, PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-flyer-users-popover',
  standalone: true,
  imports: [PopoverModule],
  templateUrl: './flyer-users-popover.component.html',
  styleUrl: './flyer-users-popover.component.sass',
})
export class FlyerUsersPopoverComponent {
  @ViewChild('popover') popover!: Popover;

  flyer = input.required<FlyerDto>();
  usersMap = input.required<Map<string, string>>();

  toggle(event: Event): void {
    this.popover.toggle(event);
  }
}
