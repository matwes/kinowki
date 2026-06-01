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
import { TooltipModule } from 'primeng/tooltip';

import { environment } from '../../../environments/environment';
import { FlyerKindNamePipe, FlyerSizeNamePipe, FlyerTypeNamePipe, ShowIfAdminDirective, UsersPipe } from '../../utils';

@Component({
  selector: 'app-big-flyer',
  templateUrl: './big-flyer.component.html',
  styleUrl: './big-flyer.component.sass',
  imports: [
    FlyerKindNamePipe,
    FlyerSizeNamePipe,
    FlyerTypeNamePipe,
    ImageModule,
    ShowIfAdminDirective,
    TooltipModule,
    UsersPipe,
  ],
})
export class BigFlyerComponent implements AfterViewInit {
  private readonly CDN_URL = environment.cdnUrl;

  @ViewChildren(Image, { read: ElementRef }) imageEls!: QueryList<ElementRef<HTMLElement>>;

  flyer = input.required<FlyerDto>();
  usersMap = input.required<Map<string, string>>();
  blankWidth = signal(175);
  isLoadingImages = signal(true);
  imageSizes = signal<Record<number, { width: number; height: number }>>({});

  isHorizontal = computed(() => {
    const first = this.imageSizes()[0];
    return first ? first.width > first.height : false;
  });

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

  imageStyles = computed(() => {
    const horizontal = this.isHorizontal();

    return this.images().map((_, index) => {
      if (horizontal) {
        return {
          'max-width': '21rem',
          'max-height': '7.875rem',
          'object-fit': 'contain',
        };
      }

      return {
        'max-width': '10.5rem',
        'max-height': '15.75rem',
        'object-fit': 'contain',
        'object-position': index % 2 === 0 ? 'right' : 'left',
      };
    });
  });

  constructor() {
    effect(() => {
      this.flyer();

      this.imageSizes.set({});
      this.blankWidth.set(175);

      queueMicrotask(() => this.updateBlankWidth());
    });
  }

  ngAfterViewInit(): void {
    this.updateBlankWidth();
  }

  private updateBlankWidth(): void {
    this.isLoadingImages.set(true);

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
