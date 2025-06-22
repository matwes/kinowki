import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { FlyerType } from './schemas/flyer-type.schema';
import { CreateFlyerTypeDto } from './dto/create-flyer-type.dto';
import { UpdateFlyerTypeDto } from './dto/update-flyer-type.dto';

@Injectable()
export class FlyerTypeService extends CrudService<FlyerType, CreateFlyerTypeDto, UpdateFlyerTypeDto> {
  name = 'flyer type';
  sortKey = 'name';

  constructor(@InjectModel(FlyerType.name) model: Model<FlyerType>) {
    super(model);
  }
}
