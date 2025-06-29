import { Pipe, PipeTransform } from '@angular/core';
import { releaseTypeMap } from '@kinowki/shared';

@Pipe({ name: 'releaseTypeName' })
export class ReleaseTypeNamePipe implements PipeTransform {
  transform(value: number): string {
    return releaseTypeMap[value] ?? 'nieznany';
  }
}
