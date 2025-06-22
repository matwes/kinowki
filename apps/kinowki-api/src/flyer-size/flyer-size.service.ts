import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { FlyerSize } from './schemas/flyer-size.schema';
import { CreateFlyerSizeDto } from './dto/create-flyer-size.dto';
import { UpdateFlyerSizeDto } from './dto/update-flyer-size.dto';

@Injectable()
export class FlyerSizeService extends CrudService<FlyerSize, CreateFlyerSizeDto, UpdateFlyerSizeDto> {
  name = 'flyer size';
  sortKey = 'width';

  constructor(@InjectModel(FlyerSize.name) model: Model<FlyerSize>) {
    super(model);
  }
}
