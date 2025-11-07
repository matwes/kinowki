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

import { environment } from '../../../environments/environment';
import { FlyerNotePipe, ShowIfAdminDirective } from '../../utils';

@Component({
  selector: 'app-big-flyer',
  templateUrl: './big-flyer.component.html',
  styleUrl: './big-flyer.component.sass',
  imports: [FlyerNotePipe, ImageModule, ShowIfAdminDirective],
})
export class BigFlyerComponent implements AfterViewInit {
  private readonly CDN_URL = environment.cdnUrl;

  flyer = input.required<FlyerDto>();
  blankWidth = signal(175);

  images = computed(() =>
    this.flyer().images.map((image) => {
      const result = { ...image };

      if (result.original && result.original !== 'blank') {
        result.original = `${this.CDN_URL}${result.original}`;
      }
      if (result.thumbnail) {
        result.thumbnail = `${this.CDN_URL}${result.thumbnail}`;
      }
      return result;
    })
  );

  imageSizes = signal<Record<number, { width: number; height: number }>>({});

  @ViewChildren(Image, { read: ElementRef }) imageEls!: QueryList<ElementRef<HTMLElement>>;

  constructor() {
    effect(() => {
      if (this.flyer()) {
        queueMicrotask(() => this.updateBlankWidth());
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateBlankWidth();
  }

  private updateBlankWidth(): void {
    const imgEls = this.imageEls.map((ref) => ref.nativeElement.querySelector('img'));

    imgEls.forEach((img, index) => {
      if (!img) {
        return;
      }

      const updateSize = () => {
        const sizes = { ...this.imageSizes() };
        sizes[index] = { width: img.naturalWidth, height: img.naturalHeight };
        this.imageSizes.set(sizes);
      };

      if (img.complete) {
        updateSize();
      } else {
        img.addEventListener('load', updateSize, { once: true });
      }
    });

    const firstImageEl = imgEls[0];
    if (firstImageEl) {
      const setWidth = () => this.blankWidth.set(firstImageEl.offsetWidth);
      if (firstImageEl.complete) {
        setWidth();
      } else {
        firstImageEl.addEventListener('load', setWidth, { once: true });
      }
    }
  }
}
