import { Pipe, PipeTransform } from '@angular/core';
import { ObjectUtils } from 'primeng/utils';

@Pipe({ name: 'join' })
export class JoinPipe implements PipeTransform {
  transform(value: unknown[], joiner = ', ', field?: string): string {
    if (!field) {
      return value.join(joiner);
    } else {
      return value.map((item) => ObjectUtils.resolveFieldData(item, field)).join(joiner);
    }
  }
}
