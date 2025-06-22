import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { UserFlyer } from './schemas/user-flyer.schema';
import { CreateUserFlyerDto } from './dto/create-user-flyer.dto';
import { UpdateUserFlyerDto } from './dto/update-user-flyer.dto';
import { UserFlyerService } from './user-flyer.service';

@Controller('user-flyer')
export class UserFlyerController extends CrudController<UserFlyer, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user flyer';

  constructor(userFlyerService: UserFlyerService) {
    super(userFlyerService);
  }
}
