import { Component, computed, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { FlyerDto } from '@kinowki/shared';
import { getClassForStatus } from '../user-status-color';
import { FlyerUsersPopoverComponent } from '../flyer-users-popover';

@Component({
  selector: 'app-user-flyer-user-statuses-button',
  templateUrl: './user-flyer-user-statuses-button.component.html',
  styleUrl: './user-flyer-user-statuses-button.component.sass',
  imports: [ButtonModule, FlyerUsersPopoverComponent],
})
export class UserFlyerUserStatusesButtonComponent {
  flyer = input.required<FlyerDto>();

  buttonClass = computed(() => getClassForStatus(this.flyer().userFlyer?.status, true));
  usersCount = computed(() => {
    const flyer = this.flyer();
    return (flyer.have?.length ?? 0) + (flyer.trade?.length ?? 0);
  });
}
