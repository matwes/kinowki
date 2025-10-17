import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto, UpdateUserDto, UserDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { User } from './user.schema';

@Injectable()
export class UserService extends CrudService<User, UserDto, CreateUserDto, UpdateUserDto> {
  name = 'user';
  sortKey = 'name';

  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }

  findByEmail(email: string) {
    return this.model.findOne({ email }).exec();
  }

  findByResetPasswordToken(token: string) {
    return this.model.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();
  }
}
