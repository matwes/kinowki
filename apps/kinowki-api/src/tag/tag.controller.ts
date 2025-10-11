import { Controller } from '@nestjs/common';

import { CreateTagDto, TagDto, UpdateTagDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { Tag } from './tag.schema';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController extends CrudController<Tag, TagDto, CreateTagDto, UpdateTagDto> {
  name = 'tag';

  constructor(tagService: TagService) {
    super(tagService);
  }
}
