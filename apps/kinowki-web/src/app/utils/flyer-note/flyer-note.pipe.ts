import { Pipe, PipeTransform } from '@angular/core';
import { FlyerDto, flyerSizeMap, flyerTypeMap } from '@kinowki/shared';

@Pipe({ name: 'flyerNote' })
export class FlyerNotePipe implements PipeTransform {
  transform(flyer: FlyerDto): string {
    const kindNote = flyer.kindNote;
    const note = flyer.note;
    const type = flyer.type && flyer.type !== 1 && flyer.type !== 14 ? flyerTypeMap[flyer.type] : null;
    const size = flyer.size && flyer.size !== 500 ? flyerSizeMap[flyer.size] : null;
    const tags = flyer.tags?.map((tag) => tag.name) ?? [];
    const orientation = flyer.orientation === 1 ? 'pozioma' : null;

    return [type, size, orientation, kindNote, note, ...tags].filter((item) => item).join(' • ');
  }
}
