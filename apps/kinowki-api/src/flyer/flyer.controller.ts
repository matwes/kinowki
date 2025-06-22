import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { Flyer } from './schemas/flyer.schema';
import { CreateFlyerDto } from './dto/create-flyer.dto';
import { UpdateFlyerDto } from './dto/update-flyer.dto';
import { FlyerService } from './flyer.service';

@Controller('flyer')
export class FlyerController extends CrudController<Flyer, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';

  constructor(flyerService: FlyerService) {
    super(flyerService);
  }
}
