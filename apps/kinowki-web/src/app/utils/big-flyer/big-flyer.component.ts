import { NgStyle } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { FlyerDto } from '@kinowki/shared';
import { Image, ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';

import { environment } from '../../../environments/environment';
import { FlyerKindNamePipe } from '../flyer-kind-name';
import { FlyerSizeNamePipe } from '../flyer-size-name';
import { FlyerTypeNamePipe } from '../flyer-type-name';
import { ShowIfAdminDirective } from '../show-if-admin';
import { ShowIfLoggedDirective } from '../show-if-logged';
import { UserFlyerStatusButtonComponent } from '../user-flyer-status-button';
import { UsersPipe } from '../users';

@Component({
  selector: 'app-big-flyer',
  templateUrl: './big-flyer.component.html',
  styleUrl: './big-flyer.component.sass',
  imports: [
    FlyerKindNamePipe,
    FlyerSizeNamePipe,
    FlyerTypeNamePipe,
    ImageModule,
    NgStyle,
    ShowIfAdminDirective,
    ShowIfLoggedDirective,
    TooltipModule,
    UserFlyerStatusButtonComponent,
    UsersPipe,
  ],
})
export class BigFlyerComponent implements AfterViewInit {
  private readonly CDN_URL = environment.cdnUrl;

  @ViewChildren(Image, { read: ElementRef }) imageEls!: QueryList<ElementRef<HTMLElement>>;

  flyer = input.required<FlyerDto>();
  usersMap = input.required<Map<string, string>>();
  statusChanged = output();

  blankSize = signal({ width: 175, height: 250 });
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
    const images = this.images();
    const horizontal = this.isHorizontal();

    return images.map((_, index) => {
      const style = {
        'max-width': '10rem',
        'max-height': '15.75rem',
        height: 'auto',
        'object-fit': 'contain',
        'object-position': '50% 50%',
      };

      if (images.length > 1) {
        if (horizontal) {
          style['max-width'] = '20rem';
          style['max-height'] = '7.75rem';
        } else {
          style['object-position'] = index % 2 === 0 ? 'right' : 'left';
        }
      } else {
        style.height = '15.75rem';
      }

      return style;
    });
  });

  blankStyle = computed(() => {
    const size = this.blankSize();

    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
    };
  });

  constructor() {
    effect(() => {
      this.flyer();
      this.imageSizes.set({});
      queueMicrotask(() => this.updateBlankWidth());
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
      const setSize = () => {
        requestAnimationFrame(() => {
          const rect = firstImageEl.getBoundingClientRect();

          this.blankSize.set({
            width: rect.width,
            height: rect.height,
          });
        });
      };

      if (firstImageEl.complete) {
        setSize();
      } else {
        firstImageEl.addEventListener('load', setSize, { once: true });
      }
    }
  }
}
