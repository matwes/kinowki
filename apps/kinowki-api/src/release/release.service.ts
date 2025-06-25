import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateReleaseDto, UpdateReleaseDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Release } from './release.schema';

@Injectable()
export class ReleaseService extends CrudService<Release, CreateReleaseDto, UpdateReleaseDto> {
  name = 'release';
  sortKey = 'date';

  constructor(@InjectModel(Release.name) model: Model<Release>) {
    super(model);
  }
}
