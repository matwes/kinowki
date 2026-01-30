import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'users' })
export class UsersPipe implements PipeTransform {
  transform(
    value: string[] | undefined,
    usersMap: Map<string, string> | null,
    title: string,
    fallback: string
  ): string {
    if (value?.length) {
      return `${title}:\n${value.map((userId) => usersMap?.get(userId) ?? userId).join('\n')}`;
    }
    return fallback;
  }
}
