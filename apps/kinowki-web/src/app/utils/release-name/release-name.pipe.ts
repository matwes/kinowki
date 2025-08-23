import { Pipe, PipeTransform } from '@angular/core';
import { ReleaseDto } from '@kinowki/shared';

@Pipe({ name: 'releaseName' })
export class ReleaseNamePipe implements PipeTransform {
  transform(release: ReleaseDto): string {
    const date = release.date.endsWith('-00') ? release.date.slice(0, -3) : release.date;

    const distributors = release.distributors.map((distributor) => distributor.name).join(' • ');
    const note = release.note ? ` | ${release.note}` : '';
    return `${date} ${distributors}${note}`;
  }
}
