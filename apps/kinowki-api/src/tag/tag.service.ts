import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateTagDto, TagDto, UpdateTagDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Tag } from './tag.schema';

@Injectable()
export class TagService extends CrudService<Tag, TagDto, CreateTagDto, UpdateTagDto> {
  name = 'tag';
  sortKey = 'name';

  constructor(@InjectModel(Tag.name) model: Model<Tag>) {
    super(model);
  }
}
