import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { Genre } from './schemas/genre.schema';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenreService extends CrudService<Genre, CreateGenreDto, UpdateGenreDto> {
  name = 'genre';
  sortKey = 'name';

  constructor(@InjectModel(Genre.name) model: Model<Genre>) {
    super(model);
  }
}
