import { Directive, ElementRef, inject, input, Renderer2, effect } from '@angular/core';
import { UserFlyerDto } from '@kinowki/shared';
import { getClassForStatus } from '../user-status-color';

@Directive({ selector: '[appUserFlyerStatusClass]' })
export class UserFlyerStatusClassDirective {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  status = input.required<UserFlyerDto | undefined>({ alias: 'appUserFlyerStatusClass' });

  constructor() {
    effect(() => {
      this.renderer.removeClass(this.el.nativeElement, 'status-have');
      this.renderer.removeClass(this.el.nativeElement, 'status-trade');
      this.renderer.removeClass(this.el.nativeElement, 'status-want');
      this.renderer.removeClass(this.el.nativeElement, 'status-unwanted');
      this.renderer.removeClass(this.el.nativeElement, 'status-unknown');
      this.renderer.addClass(this.el.nativeElement, getClassForStatus(this.status()?.status));
    });
  }
}
