import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { Film } from './schemas/film.schema';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { FilmService } from './film.service';

@Controller('film')
export class FilmController extends CrudController<Film, CreateFilmDto, UpdateFilmDto> {
  name = 'film';

  constructor(filmService: FilmService) {
    super(filmService);
  }
}
