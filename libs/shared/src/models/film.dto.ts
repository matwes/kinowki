import { DistributorDto } from './distributor.dto';

export interface CreateFilmDto {
  title: string;
  originalTitle?: string;
  firstLetter: string;
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
  releases?: {
    _id: string | undefined;
    film: FilmDto;
    date: string;
    distributors: DistributorDto[];
    releaseType: number;
    note?: string;
  }[];
}
