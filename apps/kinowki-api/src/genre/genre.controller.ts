import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { Genre } from './schemas/genre.schema';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { GenreService } from './genre.service';

@Controller('genre')
export class GenreController extends CrudController<Genre, CreateGenreDto, UpdateGenreDto> {
  name = 'genre';

  constructor(genreService: GenreService) {
    super(genreService);
  }
}
