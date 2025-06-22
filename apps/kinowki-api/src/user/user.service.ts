import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService extends CrudService<User, CreateUserDto, UpdateUserDto> {
  name = 'user';
  sortKey = 'name';

  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }
}
