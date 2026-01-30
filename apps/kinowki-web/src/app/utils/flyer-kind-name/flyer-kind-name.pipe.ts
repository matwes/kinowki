import { Pipe, PipeTransform } from '@angular/core';
import { flyerKindMap } from '@kinowki/shared';

@Pipe({ name: 'flyerKindName' })
export class FlyerKindNamePipe implements PipeTransform {
  transform(value: number): string {
    return flyerKindMap[value] ?? 'nieznany';
  }
}
