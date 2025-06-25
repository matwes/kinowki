import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateFlyerSizeDto, UpdateFlyerSizeDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { FlyerSize } from './flyer-size.schema';

@Injectable()
export class FlyerSizeService extends CrudService<FlyerSize, CreateFlyerSizeDto, UpdateFlyerSizeDto> {
  name = 'flyer size';
  sortKey = 'width';

  constructor(@InjectModel(FlyerSize.name) model: Model<FlyerSize>) {
    super(model);
  }
}
