import { Pipe, PipeTransform } from '@angular/core';
import { PrimeIcons } from 'primeng/api';

@Pipe({ name: 'flyerKindIcon' })
export class FlyerKindIconPipe implements PipeTransform {
  transform(flyerKind: number) {
    if (flyerKind === 2) {
      return PrimeIcons.MAP_MARKER;
    } else if (flyerKind === 3) {
      return PrimeIcons.STAR;
    } else if (flyerKind === 4) {
      return PrimeIcons.PLAY_CIRCLE;
    } else if (flyerKind === 5) {
      return PrimeIcons.TICKET;
    } else if (flyerKind === 6) {
      return PrimeIcons.MEGAPHONE;
    } else if (flyerKind === 7) {
      return PrimeIcons.LOCK;
    }
    return null;
  }
}
