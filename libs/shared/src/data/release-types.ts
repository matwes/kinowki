export const releaseTypes = [
  { value: 1, label: 'kinowa' },
  { value: 2, label: 'festiwalowa' },
  { value: 3, label: 'wideo' },
  { value: 4, label: 'wznowienie' },
  { value: 5, label: 'ograniczona' },
  { value: 6, label: 'wycofana' },
].sort((a, b) => a.label.localeCompare(b.label));

export const releaseTypeMap = releaseTypes.reduce(
  (map, genre) => ({ ...map, [genre.value]: genre.label }),
  {} as Record<number, string>
);
