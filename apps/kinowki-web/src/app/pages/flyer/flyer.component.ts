import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { FlyerDto } from '@kinowki/shared';
import { Image, ImageModule } from 'primeng/image';

import { FlyerNotePipe } from '../../utils';

const OBJECT_STORAGE = 'https://pub-8a8f04577dee47a2a13d9a52562d4c46.r2.dev';

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

  images = computed(() =>
    this.flyer().images.map((image) => {
      if (image.original && image.original !== 'blank') {
        image.original = `${OBJECT_STORAGE}/${image.original}`;
      }
      if (image.thumbnail) {
        image.thumbnail = `${OBJECT_STORAGE}/${image.thumbnail}`;
      } else {
        image.thumbnail = image.original;
      }
      return image;
    })
  );

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
