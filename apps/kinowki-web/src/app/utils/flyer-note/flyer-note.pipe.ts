import { Pipe, PipeTransform } from '@angular/core';
import { FlyerDto, flyerKindMap, flyerSizeMap, flyerTypeMap } from '@kinowki/shared';

@Pipe({ name: 'flyerNote' })
export class FlyerNotePipe implements PipeTransform {
  transform(flyer: FlyerDto): string {
    const note = flyer.note;
    const kind = flyer.kind && flyer.kind !== 1 ? flyerKindMap[flyer.kind] : null;
    const type = flyer.type && flyer.type !== 1 ? flyerTypeMap[flyer.type] : null;
    const size = flyer.size && flyer.size !== 1 ? flyerSizeMap[flyer.size] : null;
    const tags = flyer.tags?.map((tag) => tag.name) ?? [];

    return [kind, type, size, note, ...tags].filter((item) => item).join(' • ');
  }
}
