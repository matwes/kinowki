import { Component, input } from '@angular/core';
import { FlyerDto } from '@kinowki/shared';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-flyer',
  templateUrl: './flyer.component.html',
  styleUrl: './flyer.component.sass',
  imports: [ImageModule],
})
export class FlyerComponent {
  flyer = input.required<FlyerDto>();
  index = input<number>();
}
