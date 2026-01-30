export const flyerKinds = [
  { value: 1, label: 'masowy' },
  { value: 5, label: 'sieciowy' },
  { value: 2, label: 'limitowany' },
  { value: 3, label: 'festiwalowy' },
  { value: 6, label: 'promocyjny' },
  { value: 7, label: 'zamknięty' },
  { value: 4, label: 'wideo' },
];

export const flyerKindMap = flyerKinds.reduce(
  (map, kind) => ({ ...map, [kind.value]: kind.label }),
  {} as Record<number, string>
);
