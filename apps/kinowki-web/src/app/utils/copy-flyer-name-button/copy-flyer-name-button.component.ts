import { Component, computed, inject, input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { FlyerDto } from '@kinowki/shared';
import { getClassForStatus } from '../user-status-color';

@Component({
  selector: 'app-copy-flyer-name-button',
  templateUrl: './copy-flyer-name-button.component.html',
  styleUrl: './copy-flyer-name-button.component.sass',
  imports: [ButtonModule],
})
export class CopyFlyerNameButtonComponent {
  private readonly messageService = inject(MessageService);

  flyer = input.required<FlyerDto>();
  small = input(false);

  buttonClass = computed(() => getClassForStatus(this.flyer().userFlyer?.status, true));

  copy() {
    const flyerName = this.flyer().sortName;

    navigator.clipboard.writeText(flyerName);

    this.messageService.add({
      severity: 'success',
      summary: 'Skopiowano do schowka',
      detail: flyerName,
      life: 3000,
    });
  }
}
