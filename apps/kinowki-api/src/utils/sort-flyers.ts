import { FlyerDto } from '@kinowki/shared';

const compareNullableNumbers = (a?: number | null, b?: number | null) =>
  a == null ? (b == null ? 0 : 1) : b == null ? -1 : a - b;

const compareNullableStrings = (a?: string | null, b?: string | null) =>
  a == null ? (b == null ? 0 : 1) : b == null ? -1 : a.localeCompare(b);

export const sortFlyers = (a: FlyerDto, b: FlyerDto) => {
  const kindA = a.kind === 1 ? 0 : a.kind;
  const kindB = b.kind === 1 ? 0 : b.kind;

  return (
    kindA - kindB ||
    compareNullableNumbers(a.type, b.type) ||
    compareNullableNumbers(a.size, b.size) ||
    compareNullableStrings(a.kindNote, b.kindNote) ||
    compareNullableStrings(a.note, b.note)
  );
};
