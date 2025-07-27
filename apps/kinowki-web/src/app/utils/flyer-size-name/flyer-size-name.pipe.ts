import { Pipe, PipeTransform } from '@angular/core';
import { flyerSizeMap } from '@kinowki/shared';

@Pipe({ name: 'flyerSizeName' })
export class FlyerSizeNamePipe implements PipeTransform {
  transform(value: number): string {
    return flyerSizeMap[value] ?? 'nieznany';
  }
}
