import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'users' })
export class UsersPipe implements PipeTransform {
  transform(value: string[] | undefined, usersMap: Map<string, string> | null): string {
    return (value ?? []).map((userId) => usersMap?.get(userId) ?? userId).join('\n');
  }
}
