import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

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

  override async getAll(params?: { first: number; rows: number }, filters?: FilterQuery<User>): Promise<UserDto[]> {
    let query = this.model.find(filters);

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query
      .sort({ [this.sortKey]: this.sortOrder })
      .collation({ locale: 'pl', strength: 1 })
      .select('name email haveTotal tradeTotal wantTotal')
      .lean<UserDto[]>()
      .exec();
    if (!itemData) {
      throw new NotFoundException(`User data not found!`);
    }
    return itemData;
  }

  findByEmail(email: string) {
    return this.model.findOne({ email }).exec();
  }

  findByResetPasswordToken(token: string) {
    return this.model
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();
  }
}
