import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { Distributor } from './schemas/distributor.schema';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { DistributorService } from './distributor.service';

@Controller('distributor')
export class DistributorController extends CrudController<Distributor, CreateDistributorDto, UpdateDistributorDto> {
  name = 'distributor';

  constructor(distributorService: DistributorService) {
    super(distributorService);
  }
}
