import { Injectable } from '@angular/core';
import { CreateFilmGroupDto, FilmDto, FilmGroupDto, UpdateFilmGroupDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class FilmGroupService extends CrudService<FilmGroupDto, CreateFilmGroupDto, UpdateFilmGroupDto> {
  name = 'film-group';

  getGroupByFilm(filmId: string) {
    return this.httpClient.get<{ message: string; data: { films: FilmDto[] } }>(`${this.url}/film/${filmId}`);
  }
}
