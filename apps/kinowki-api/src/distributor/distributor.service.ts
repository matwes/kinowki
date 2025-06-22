import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CrudService } from '../utils';
import { Distributor } from './schemas/distributor.schema';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';

@Injectable()
export class DistributorService extends CrudService<Distributor, CreateDistributorDto, UpdateDistributorDto> {
  name = 'distributor';
  sortKey = 'name';

  constructor(@InjectModel(Distributor.name) model: Model<Distributor>) {
    super(model);
  }
}
