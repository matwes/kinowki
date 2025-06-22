import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { Release } from './schemas/release.schema';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Injectable()
export class ReleaseService extends CrudService<Release, CreateReleaseDto, UpdateReleaseDto> {
  name = 'release';
  sortKey = 'date';

  constructor(@InjectModel(Release.name) model: Model<Release>) {
    super(model);
  }
}
