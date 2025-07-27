import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'imdb' })
export class ImdbPipe implements PipeTransform {
  transform(value: number): string {
    return `https://www.imdb.com/title/tt${value.toString().padStart(7, '0')}`;
  }
}
