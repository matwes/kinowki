import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateFilmDto, FilmDto, UpdateFilmDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class FilmService extends CrudService<FilmDto, CreateFilmDto, UpdateFilmDto> {
  name = 'film';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }
}
