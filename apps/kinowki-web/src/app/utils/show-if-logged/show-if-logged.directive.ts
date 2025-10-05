import { Directive, effect, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../services';

@Directive({ selector: '[appShowIfLogged]' })
export class ShowIfLoggedDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    effect(() => {
      this.viewContainer.clear();
      if (this.authService.isLoggedIn()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
