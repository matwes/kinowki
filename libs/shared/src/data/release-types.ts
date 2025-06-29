export const releaseTypes = [
  { value: 1, label: 'Kinowa' },
  { value: 2, label: 'Festiwalowa' },
  { value: 3, label: 'Wideo' },
  { value: 4, label: 'Wznowienie' },
  { value: 5, label: 'Ograniczona' },
].sort((a, b) => a.label.localeCompare(b.label));

export const releaseTypeMap = releaseTypes.reduce(
  (map, genre) => ({ ...map, [genre.value]: genre.label }),
  {} as Record<number, string>
);
