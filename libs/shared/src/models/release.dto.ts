import { DistributorDto } from './distributor.dto';
import { FilmDto } from './film.dto';
import { FlyerDto } from './flyer.dto';

export interface CreateReleaseDto {
  film: string;
  date: string;
  distributors: number[];
  releaseType: number;
  note?: string;
}

export interface UpdateReleaseDto extends Partial<CreateReleaseDto> {
  _id: string;
}

export interface ReleaseDto extends Omit<CreateReleaseDto, 'film' | 'distributors'> {
  _id: string;
  film: FilmDto;
  distributors: DistributorDto[];
  flyers?: FlyerDto[];
}
