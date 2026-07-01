import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateFilmGroupDto, FilmGroupDto, UpdateFilmGroupDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { FilmGroup } from './film-group.schema';

@Injectable()
export class FilmGroupService extends CrudService<FilmGroup, FilmGroupDto, CreateFilmGroupDto, UpdateFilmGroupDto> {
  name = 'film group';
  sortKey = 'name';

  constructor(@InjectModel(FilmGroup.name) model: Model<FilmGroup>) {
    super(model);
  }
}
