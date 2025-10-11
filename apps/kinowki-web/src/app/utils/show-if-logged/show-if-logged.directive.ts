import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../services';

@Directive({ selector: '[appShowIfLogged]' })
export class ShowIfLoggedDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  constructor() {
    effect(() => {
      this.viewContainer.clear();
      if (this.authService.isLoggedIn()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
