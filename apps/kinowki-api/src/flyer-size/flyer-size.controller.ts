import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { FlyerSize } from './schemas/flyer-size.schema';
import { CreateFlyerSizeDto } from './dto/create-flyer-size.dto';
import { UpdateFlyerSizeDto } from './dto/update-flyer-size.dto';
import { FlyerSizeService } from './flyer-size.service';

@Controller('flyer-size')
export class FlyerSizeController extends CrudController<FlyerSize, CreateFlyerSizeDto, UpdateFlyerSizeDto> {
  name = 'flyer size';

  constructor(flyerSizeService: FlyerSizeService) {
    super(flyerSizeService);
  }
}
