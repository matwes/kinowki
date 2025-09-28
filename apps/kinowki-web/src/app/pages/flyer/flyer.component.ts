import { AfterViewInit, Component, effect, ElementRef, input, QueryList, signal, ViewChildren } from '@angular/core';
import { FlyerDto } from '@kinowki/shared';
import { Image, ImageModule } from 'primeng/image';

import { FlyerNotePipe } from '../../utils';

@Component({
  selector: 'app-flyer',
  templateUrl: './flyer.component.html',
  styleUrl: './flyer.component.sass',
  imports: [FlyerNotePipe, ImageModule],
})
export class FlyerComponent implements AfterViewInit {
  flyer = input.required<FlyerDto>();
  big = input(false);
  blankWidth = signal(175);

  @ViewChildren(Image, { read: ElementRef }) imageEls!: QueryList<ElementRef<HTMLElement>>;

  constructor() {
    effect(() => {
      const flyerValue = this.flyer();
      if (flyerValue) {
        queueMicrotask(() => this.updateBlankWidth());
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateBlankWidth();
  }

  private updateBlankWidth(): void {
    const firstImageEl = this.imageEls.first?.nativeElement.querySelector('img');
    if (!firstImageEl) return;

    const setWidth = () => this.blankWidth.set(firstImageEl.offsetWidth);

    if (firstImageEl.complete) {
      setWidth();
    } else {
      firstImageEl.addEventListener('load', setWidth, { once: true });
    }
  }
}
