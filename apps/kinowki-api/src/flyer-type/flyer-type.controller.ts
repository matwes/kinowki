import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { FlyerType } from './schemas/flyer-type.schema';
import { CreateFlyerTypeDto } from './dto/create-flyer-type.dto';
import { UpdateFlyerTypeDto } from './dto/update-flyer-type.dto';
import { FlyerTypeService } from './flyer-type.service';

@Controller('flyer-type')
export class FlyerTypeController extends CrudController<FlyerType, CreateFlyerTypeDto, UpdateFlyerTypeDto> {
  name = 'flyer type';

  constructor(flyerTypeService: FlyerTypeService) {
    super(flyerTypeService);
  }
}
