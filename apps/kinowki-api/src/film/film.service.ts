import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { Film } from './schemas/film.schema';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';

@Injectable()
export class FilmService extends CrudService<Film, CreateFilmDto, UpdateFilmDto> {
  name = 'film';
  sortKey = 'title';

  constructor(@InjectModel(Film.name) model: Model<Film>) {
    super(model);
  }
}
