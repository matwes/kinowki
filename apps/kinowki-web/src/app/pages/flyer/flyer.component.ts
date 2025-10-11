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
import {
  FlyerNotePipe,
  ShowIfLoggedDirective,
  UserFlyerStatusButtonComponent,
  UserFlyerStatusClassDirective,
} from '../../utils';

@Component({
  selector: 'app-flyer',
  templateUrl: './flyer.component.html',
  styleUrl: './flyer.component.sass',
  imports: [
    FlyerNotePipe,
    ImageModule,
    ShowIfLoggedDirective,
    UserFlyerStatusButtonComponent,
    UserFlyerStatusClassDirective,
  ],
})
export class FlyerComponent implements AfterViewInit {
  private readonly CDN_URL = environment.cdnUrl;

  flyer = input.required<FlyerDto>();
  big = input(false);
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
    const firstImageEl = this.imageEls.first?.nativeElement.querySelector('img');
    if (!firstImageEl) {
      return;
    }

    const setWidth = () => this.blankWidth.set(firstImageEl.offsetWidth);

    if (firstImageEl.complete) {
      setWidth();
    } else {
      firstImageEl.addEventListener('load', setWidth, { once: true });
    }
  }
}
