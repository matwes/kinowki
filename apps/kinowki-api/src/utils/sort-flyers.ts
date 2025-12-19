import { FlyerDto } from '@kinowki/shared';

export const sortFlyers = (a: FlyerDto, b: FlyerDto) => {
  return a.type !== b.type
    ? a.type == null
      ? 1
      : b.type == null
      ? -1
      : a.type - b.type
    : a.size !== b.size
    ? a.size == null
      ? 1
      : b.size == null
      ? -1
      : a.size - b.size
    : a.note !== b.note
    ? !a.note
      ? 1
      : !b.note
      ? -1
      : a.note.localeCompare(b.note)
    : 0;
};
