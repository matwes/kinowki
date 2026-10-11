import { Component, ViewChild, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FlyerDto } from '@kinowki/shared';
import { Popover, PopoverModule } from 'primeng/popover';
import { UserService } from '../../services';

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

  readonly usersMap = toSignal(inject(UserService).getUserMap(), {
    initialValue: new Map<string, string>(),
  });

  toggle(event: Event): void {
    this.popover.toggle(event);
  }
}
