import { Controller } from '@nestjs/common';

import { CreateFilmDto, UpdateFilmDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { Film } from './film.schema';
import { FilmService } from './film.service';

@Controller('film')
export class FilmController extends CrudController<Film, CreateFilmDto, UpdateFilmDto> {
  name = 'film';

  constructor(filmService: FilmService) {
    super(filmService);
  }
}
