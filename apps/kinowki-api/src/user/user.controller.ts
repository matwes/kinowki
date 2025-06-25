import { Controller } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends CrudController<User, CreateUserDto, UpdateUserDto> {
  name = 'user';

  constructor(userService: UserService) {
    super(userService);
  }
}
