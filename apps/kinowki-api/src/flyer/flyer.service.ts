import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { CreateFlyerDto, UpdateFlyerDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Flyer } from './flyer.schema';

@Injectable()
export class FlyerService extends CrudService<Flyer, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';
  sortKey = '_id';

  constructor(@InjectModel(Flyer.name) model: Model<Flyer>) {
    super(model);
  }

  override async getAll(params?: { first: number; rows: number }, filters?: FilterQuery<Flyer>) {
    let query = this.model
      .find(filters)
      .populate('tags')
      .populate({ path: 'releases', populate: { path: 'film' } });

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query.sort({ createdAt: -1 }).collation({ locale: 'pl', strength: 2 }).lean().exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }
}
