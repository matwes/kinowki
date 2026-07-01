export interface CreateFilmGroupDto {
  name: string;
}

export interface UpdateFilmGroupDto extends Partial<CreateFilmGroupDto> {
  _id: string;
}

export interface FilmGroupDto extends CreateFilmGroupDto {
  _id: string;
}
