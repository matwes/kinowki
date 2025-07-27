export const flyerTypes = [
  { value: 1, label: 'Zwykła' },
  { value: 2, label: 'Sztywna' },
  { value: 3, label: 'Pocztówka' },
  { value: 4, label: 'Zakładka' },
  { value: 5, label: 'Naklejka' },
  { value: 6, label: 'Rozkładana' },
  { value: 7, label: 'Zszywana' },
  { value: 8, label: 'Plan lekcji' },
  { value: 9, label: 'Tatuaż' },
];

export const flyerTypeMap = flyerTypes.reduce(
  (map, genre) => ({ ...map, [genre.value]: genre.label }),
  {} as Record<number, string>
);
