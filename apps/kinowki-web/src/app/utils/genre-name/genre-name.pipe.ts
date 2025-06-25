import { Pipe, PipeTransform } from '@angular/core';
import { genreMap } from '@kinowki/shared';

@Pipe({ name: 'genreName' })
export class GenreNamePipe implements PipeTransform {
  transform(value: number): string {
    return genreMap[value] ?? 'nieznany';
  }
}
