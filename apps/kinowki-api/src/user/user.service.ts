import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto, UpdateUserDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService extends CrudService<User, CreateUserDto, UpdateUserDto> {
  name = 'user';
  sortKey = 'name';

  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }

  findByEmail(email: string) {
    return this.model.findOne({ email }).lean<UserDocument>().exec();
  }
}
