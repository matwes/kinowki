export const genres = [
  { value: 1, label: 'Animacja' },
  { value: 2, label: 'Animacja dla dorosłych' },
  { value: 3, label: 'Anime' },
  { value: 4, label: 'Baśń' },
  { value: 5, label: 'Biblijny' },
  { value: 6, label: 'Biograficzny' },
  { value: 7, label: 'Czarna komedia' },
  { value: 8, label: 'Dla dzieci' },
  { value: 9, label: 'Dla młodzieży' },
  { value: 10, label: 'Dokumentalizowany' },
  { value: 11, label: 'Dokumentalny' },
  { value: 12, label: 'Dramat' },
  { value: 13, label: 'Dramat historyczny' },
  { value: 14, label: 'Dramat obyczajowy' },
  { value: 15, label: 'Dramat sądowy' },
  { value: 16, label: 'Dreszczowiec' },
  { value: 17, label: 'Erotyczny' },
  { value: 18, label: 'Fabularyzowany dok.' },
  { value: 19, label: 'Familijny' },
  { value: 20, label: 'Fantasy' },
  { value: 21, label: 'Film-Noir' },
  { value: 22, label: 'Gangsterski' },
  { value: 23, label: 'Groteska filmowa' },
  { value: 24, label: 'Historyczny' },
  { value: 25, label: 'Horror' },
  { value: 26, label: 'Katastroficzny' },
  { value: 27, label: 'Komedia' },
  { value: 28, label: 'Komedia kryminalna' },
  { value: 29, label: 'Komedia obycz.' },
  { value: 30, label: 'Komedia rom.' },
  { value: 31, label: 'Kostiumowy' },
  { value: 32, label: 'Krótkometrażowy' },
  { value: 33, label: 'Kryminał' },
  { value: 34, label: 'Melodramat' },
  { value: 35, label: 'Musical' },
  { value: 36, label: 'Muzyczny' },
  { value: 37, label: 'Niemy' },
  { value: 38, label: 'Obyczajowy' },
  { value: 39, label: 'Poetycki' },
  { value: 40, label: 'Polityczny' },
  { value: 41, label: 'Propagandowy' },
  { value: 42, label: 'Przygodowy' },
  { value: 43, label: 'Przyrodniczy' },
  { value: 44, label: 'Psychologiczny' },
  { value: 45, label: 'Religijny' },
  { value: 46, label: 'Romans' },
  { value: 47, label: 'Satyra' },
  { value: 48, label: 'Sci-Fi' },
  { value: 49, label: 'Sensacyjny' },
  { value: 50, label: 'Sportowy' },
  { value: 51, label: 'Surrealistyczny' },
  { value: 52, label: 'Szpiegowski' },
  { value: 53, label: 'Sztuki walki' },
  { value: 54, label: 'Świąteczny' },
  { value: 55, label: 'Thriller' },
  { value: 56, label: 'True crime' },
  { value: 57, label: 'Western' },
  { value: 58, label: 'Wojenny' },
  { value: 59, label: 'XXX' },
  { value: 60, label: 'Akcja' },
].sort((a, b) => a.label.localeCompare(b.label));

export const genreMap = genres.reduce(
  (map, genre) => ({ ...map, [genre.value]: genre.label }),
  {} as Record<number, string>
);
