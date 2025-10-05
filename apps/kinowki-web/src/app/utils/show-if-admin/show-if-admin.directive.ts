import { Directive, effect, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../services';

@Directive({ selector: '[appShowIfAdmin]' })
export class ShowIfAdminDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    effect(() => {
      this.viewContainer.clear();
      if (this.authService.isAdmin()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
