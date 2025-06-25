import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserFlyerDto, UpdateUserFlyerDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { UserFlyer } from './user-flyer.schema';

@Injectable()
export class UserFlyerService extends CrudService<UserFlyer, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user flyer';
  sortKey = 'flyer';

  constructor(@InjectModel(UserFlyer.name) model: Model<UserFlyer>) {
    super(model);
  }
}
