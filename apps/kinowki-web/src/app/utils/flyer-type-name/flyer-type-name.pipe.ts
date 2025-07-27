import { Pipe, PipeTransform } from '@angular/core';
import { flyerTypeMap } from '@kinowki/shared';

@Pipe({ name: 'flyerTypeName' })
export class FlyerTypeNamePipe implements PipeTransform {
  transform(value: number): string {
    return flyerTypeMap[value] ?? 'nieznany';
  }
}
