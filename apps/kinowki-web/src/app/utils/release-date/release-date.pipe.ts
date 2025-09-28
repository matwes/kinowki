import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { ReleaseDto } from '@kinowki/shared';

@Pipe({ name: 'releaseDate' })
export class ReleaseDatePipe implements PipeTransform {
  readonly datePipe = inject(DatePipe);

  transform(release: ReleaseDto): string {
    if (!release?.date) return '';

    if (release.date.endsWith('-00')) {
      return 'Brak konkretnej daty';
    } else {
      return this.datePipe.transform(release.date, 'd MMMM') ?? '';
    }
  }
}
