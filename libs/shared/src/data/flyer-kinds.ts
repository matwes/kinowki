export const flyerKinds = [
  { value: 1, label: 'zwykła' },
  { value: 2, label: 'lokalna' },
  { value: 3, label: 'festiwalowa' },
  { value: 4, label: 'wideo' },
];

export const flyerKindMap = flyerKinds.reduce(
  (map, kind) => ({ ...map, [kind.value]: kind.label }),
  {} as Record<number, string>
);
