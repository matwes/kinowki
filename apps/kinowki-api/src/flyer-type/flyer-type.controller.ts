import { Controller } from '@nestjs/common';

import { CreateFlyerTypeDto, UpdateFlyerTypeDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { FlyerType } from './flyer-type.schema';
import { FlyerTypeService } from './flyer-type.service';

@Controller('flyer-type')
export class FlyerTypeController extends CrudController<FlyerType, CreateFlyerTypeDto, UpdateFlyerTypeDto> {
  name = 'flyer type';

  constructor(flyerTypeService: FlyerTypeService) {
    super(flyerTypeService);
  }
}
