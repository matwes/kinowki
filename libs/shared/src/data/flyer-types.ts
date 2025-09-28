export const flyerTypes = [
  { value: 1, label: 'miękka' },
  { value: 2, label: 'sztywna' },
  { value: 3, label: 'pocztówka' },
  { value: 4, label: 'zakładka' },
  { value: 5, label: 'profilowana' },
  { value: 6, label: 'rozkładana' },
  { value: 7, label: 'zszywana' },
  { value: 8, label: 'plan lekcji' },
  { value: 9, label: 'tatuaż' },
  { value: 10, label: 'naklejka' },
  { value: 11, label: 'wizytówka' },
  { value: 12, label: 'zawieszka' },
  { value: 13, label: 'kalendarzyk' },
  { value: 14, label: 'inna' },
];

export const flyerTypeMap = flyerTypes.reduce(
  (map, genre) => ({ ...map, [genre.value]: genre.label }),
  {} as Record<number, string>
);
