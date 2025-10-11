import { Controller } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto, UserDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends CrudController<User, UserDto, CreateUserDto, UpdateUserDto> {
  name = 'user';

  constructor(userService: UserService) {
    super(userService);
  }
}
