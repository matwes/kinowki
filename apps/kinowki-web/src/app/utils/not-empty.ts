/* eslint-disable @typescript-eslint/no-explicit-any */
export function notEmpty<T = any>(item: T | undefined | null): item is T {
  return item !== undefined && item !== null;
}
