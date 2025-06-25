import { Controller } from '@nestjs/common';

import { CreateUserFlyerDto, UpdateUserFlyerDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { UserFlyer } from './user-flyer.schema';
import { UserFlyerService } from './user-flyer.service';

@Controller('user-flyer')
export class UserFlyerController extends CrudController<UserFlyer, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user flyer';

  constructor(userFlyerService: UserFlyerService) {
    super(userFlyerService);
  }
}
