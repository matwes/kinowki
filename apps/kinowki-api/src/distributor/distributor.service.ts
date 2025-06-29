import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateDistributorDto, UpdateDistributorDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Distributor } from './distributor.schema';

@Injectable()
export class DistributorService extends CrudService<Distributor, CreateDistributorDto, UpdateDistributorDto> {
  name = 'distributor';
  sortKey = 'name';

  constructor(@InjectModel(Distributor.name) model: Model<Distributor>) {
    super(model);
  }
}
