import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { Flyer } from './schemas/flyer.schema';
import { CreateFlyerDto } from './dto/create-flyer.dto';
import { UpdateFlyerDto } from './dto/update-flyer.dto';

@Injectable()
export class FlyerService extends CrudService<Flyer, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';
  sortKey = '_id';

  constructor(@InjectModel(Flyer.name) model: Model<Flyer>) {
    super(model);
  }
}
