export interface CreateFilmDto {
  title: string;
  originalTitle?: string;
  year: number;
  genres: number[];
  description?: string;
  imdb?: number;
}

export interface UpdateFilmDto extends Partial<CreateFilmDto> {
  _id: string;
}

export interface FilmDto extends CreateFilmDto {
  _id: string;
}
