import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PrimeIcons } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConnectedOverlayScrollHandler } from 'primeng/dom';
import { Popover, PopoverModule } from 'primeng/popover';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { FlyerDto, UserFlyerDto, UserFlyerStatus } from '@kinowki/shared';
import { UserFlyerService } from '../../services';
import { getClassForStatus } from '../user-status-color';

@UntilDestroy()
@Component({
  selector: 'app-user-flyer-status-button',
  templateUrl: './user-flyer-status-button.component.html',
  styleUrl: './user-flyer-status-button.component.sass',
  imports: [ButtonModule, PopoverModule, ReactiveFormsModule, SelectButtonModule, TextareaModule, TooltipModule],
})
export class UserFlyerStatusButtonComponent implements AfterViewInit {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly userFlyerService = inject(UserFlyerService);

  @ViewChild('popover', { static: true }) popover?: Popover;

  flyer = input.required<FlyerDto>();
  small = input(false);
  statusChanged = output<UserFlyerDto>();

  form = this.fb.group({
    _id: '',
    flyer: '',
    status: null as null | UserFlyerStatus,
    note: '',
  });

  buttonIcon = signal(PrimeIcons.PLUS);
  buttonClass = signal('');

  userFlyerStatuses = [
    {
      icon: this.getIconForStatus(UserFlyerStatus.HAVE),
      value: UserFlyerStatus.HAVE,
      tooltip: 'Mam w kolekcji',
    },
    {
      icon: this.getIconForStatus(UserFlyerStatus.TRADE),
      value: UserFlyerStatus.TRADE,
      tooltip: 'Mam na wymianę',
    },
    {
      icon: this.getIconForStatus(UserFlyerStatus.WANT),
      value: UserFlyerStatus.WANT,
      tooltip: 'Szukam',
    },
    {
      icon: this.getIconForStatus(UserFlyerStatus.UNWANTED),
      value: UserFlyerStatus.UNWANTED,
      tooltip: 'Nie jestem zainteresowany',
    },
  ];

  constructor() {
    effect(() => this.fillForm(this.flyer()));
  }

  ngAfterViewInit(): void {
    const popover = this.popover;
    if (popover) {
      popover.bindScrollListener = () => {
        if (!popover.scrollHandler) {
          popover.scrollHandler = new ConnectedOverlayScrollHandler(popover.target, () => popover.align());
        }
        popover.scrollHandler.bindScrollListener();
      };

      popover.onShow
        .asObservable()
        .pipe(untilDestroyed(this))
        .subscribe(() => this.renderer.addClass(this.el.nativeElement, 'visible'));

      popover.onHide
        .asObservable()
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.renderer.removeClass(this.el.nativeElement, 'visible');
          this.fillForm(this.flyer());
        });
    }
  }

  save() {
    const flyerDto = this.flyer();
    const status = this.form.controls.status.value;

    if (flyerDto && status !== null) {
      const _id = this.form.controls._id.value;
      const flyer = this.form.controls.flyer.value;
      const note = this.form.controls.note.value.trim();

      if (status !== undefined) {
        (_id
          ? this.userFlyerService.update(_id, { status, note })
          : this.userFlyerService.create({ flyer, status, note })
        )
          .pipe(untilDestroyed(this))
          .subscribe((res) => {
            this.statusChanged.emit(res.data);
            this.updateButton(res.data.status);
            this.popover?.hide();
          });
      }
    } else {
      this.popover?.hide();
    }
  }

  private fillForm(flyer: FlyerDto) {
    this.form.controls.flyer.setValue(flyer._id);
    if (flyer.userFlyer) {
      this.form.controls._id.setValue(flyer.userFlyer._id);
      this.form.controls.status.setValue(flyer.userFlyer.status);
      this.form.controls.note.setValue(flyer.userFlyer.note ?? '');
    } else {
      this.form.controls._id.setValue('');
      this.form.controls.status.setValue(null);
      this.form.controls.note.setValue('');
    }

    this.updateButton(flyer.userFlyer?.status);
  }

  private updateButton(status?: UserFlyerStatus) {
    this.buttonClass.set(getClassForStatus(status, true));
    this.buttonIcon.set(this.getIconForStatus(status));
  }

  private getIconForStatus(status?: UserFlyerStatus) {
    switch (status) {
      case UserFlyerStatus.HAVE:
        return PrimeIcons.CHECK;
      case UserFlyerStatus.TRADE:
        return PrimeIcons.ARROW_RIGHT_ARROW_LEFT;
      case UserFlyerStatus.WANT:
        return PrimeIcons.SEARCH;
      case UserFlyerStatus.UNWANTED:
        return PrimeIcons.BAN;
      default:
        return PrimeIcons.PLUS;
    }
  }
}
