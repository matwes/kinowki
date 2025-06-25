import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateFlyerTypeDto, UpdateFlyerTypeDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { FlyerType } from './flyer-type.schema';

@Injectable()
export class FlyerTypeService extends CrudService<FlyerType, CreateFlyerTypeDto, UpdateFlyerTypeDto> {
  name = 'flyer type';
  sortKey = 'name';

  constructor(@InjectModel(FlyerType.name) model: Model<FlyerType>) {
    super(model);
  }
}
