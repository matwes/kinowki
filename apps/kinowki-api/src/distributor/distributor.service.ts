import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { CreateDistributorDto, UpdateDistributorDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Distributor } from './distributor.schema';

@Injectable()
export class DistributorService extends CrudService<Distributor, CreateDistributorDto, UpdateDistributorDto> {
  name = 'distributor';
  sortKey = 'releasesCount';

  constructor(@InjectModel(Distributor.name) model: Model<Distributor>) {
    super(model);

    this.sortOrder = -1;
  }

  override async getAll(params?: { first: number; rows: number }, filters?: FilterQuery<Distributor>) {
    let query = this.model.find(filters);

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query
      .sort({ releasesCount: -1, name: 1 })
      .collation({ locale: 'pl', strength: 1 })
      .lean()
      .exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }
}
