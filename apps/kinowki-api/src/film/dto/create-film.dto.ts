export class CreateFilmDto {
  readonly title: string;
  readonly originalTitle?: string;
  readonly year: number;
  readonly genres: string[];
  readonly description?: string;
  readonly imdb?: number;
}
