import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { Tag } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController extends CrudController<Tag, CreateTagDto, UpdateTagDto> {
  name = 'tag';

  constructor(tagService: TagService) {
    super(tagService);
  }
}
