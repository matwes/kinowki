import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateFilmDto, UpdateFilmDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Film } from './film.schema';

@Injectable()
export class FilmService extends CrudService<Film, CreateFilmDto, UpdateFilmDto> {
  name = 'film';
  sortKey = 'title';

  constructor(@InjectModel(Film.name) model: Model<Film>) {
    super(model);
  }
}
