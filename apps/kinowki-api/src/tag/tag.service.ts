import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { Tag } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService extends CrudService<Tag, CreateTagDto, UpdateTagDto> {
  name = 'tag';
  sortKey = 'name';

  constructor(@InjectModel(Tag.name) model: Model<Tag>) {
    super(model);
  }
}
