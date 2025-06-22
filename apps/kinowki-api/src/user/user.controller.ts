import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends CrudController<User, CreateUserDto, UpdateUserDto> {
  name = 'user';

  constructor(userService: UserService) {
    super(userService);
  }
}
