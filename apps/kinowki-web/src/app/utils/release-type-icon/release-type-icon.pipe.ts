import { Pipe, PipeTransform } from '@angular/core';
import { PrimeIcons } from 'primeng/api';

@Pipe({ name: 'releaseTypeIcon' })
export class ReleaseTypeIconPipe implements PipeTransform {
  transform(releaseType: number) {
    if (releaseType === 1) {
      return PrimeIcons.VIDEO;
    } else if (releaseType === 2) {
      return PrimeIcons.TROPHY;
    } else if (releaseType === 3) {
      return PrimeIcons.PLAY_CIRCLE;
    } else if (releaseType === 4) {
      return PrimeIcons.UNDO;
    } else if (releaseType === 5) {
      return PrimeIcons.MAP_MARKER;
    } else if (releaseType === 6) {
      return PrimeIcons.TIMES;
    }
    return null;
  }
}
