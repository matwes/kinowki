import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { UserFlyer } from './schemas/user-flyer.schema';
import { CreateUserFlyerDto } from './dto/create-user-flyer.dto';
import { UpdateUserFlyerDto } from './dto/update-user-flyer.dto';

@Injectable()
export class UserFlyerService extends CrudService<UserFlyer, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user flyer';
  sortKey = 'flyer';

  constructor(@InjectModel(UserFlyer.name) model: Model<UserFlyer>) {
    super(model);
  }
}
