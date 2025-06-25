import { Controller } from '@nestjs/common';

import { CreateFlyerSizeDto, UpdateFlyerSizeDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { FlyerSize } from './flyer-size.schema';
import { FlyerSizeService } from './flyer-size.service';

@Controller('flyer-size')
export class FlyerSizeController extends CrudController<FlyerSize, CreateFlyerSizeDto, UpdateFlyerSizeDto> {
  name = 'flyer size';

  constructor(flyerSizeService: FlyerSizeService) {
    super(flyerSizeService);
  }
}
