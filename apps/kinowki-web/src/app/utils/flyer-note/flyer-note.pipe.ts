import { Pipe, PipeTransform } from '@angular/core';
import { FlyerDto, flyerSizeMap, flyerTypeMap } from '@kinowki/shared';

@Pipe({ name: 'flyerNote' })
export class FlyerNotePipe implements PipeTransform {
  transform(flyer: FlyerDto): string {
    const note = flyer.note;
    const type = flyer.type ? flyerTypeMap[flyer.type] : null;
    const size = flyer.size ? flyerSizeMap[flyer.size] : null;
    const tags = flyer.tags?.map((tag) => tag.name) ?? [];

    return [type, size, note, ...tags].filter((item) => item).join(' • ');
  }
}
