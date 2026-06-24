import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';

@Pipe({ name: 'releaseDate' })
export class ReleaseDatePipe implements PipeTransform {
  readonly datePipe = inject(DatePipe);

  transform(date: Nullable<string>, mode: 'long' | 'short' = 'long'): string {
    if (!date) return '';

    const [year, month, day] = date.split('-');

    if (mode === 'short') {
      if (!day || day === '00') {
        return `${year}-${month}`;
      }
      return `${year}-${month}-${day}`;
    }

    if (day === '00') {
      return 'Brak konkretnej daty';
    }

    return this.datePipe.transform(date, 'd MMMM') ?? '';
  }
}
