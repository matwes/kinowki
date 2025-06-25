import { Controller } from '@nestjs/common';

import { CreateFlyerDto, UpdateFlyerDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { Flyer } from './flyer.schema';
import { FlyerService } from './flyer.service';

@Controller('flyer')
export class FlyerController extends CrudController<Flyer, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';

  constructor(flyerService: FlyerService) {
    super(flyerService);
  }
}
