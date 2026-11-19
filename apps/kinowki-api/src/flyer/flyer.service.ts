import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { CreateFlyerDto, FlyerDto, migrationFlyerSizes, UpdateFlyerDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Flyer } from './flyer.schema';

@Injectable()
export class FlyerService extends CrudService<Flyer, FlyerDto, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';
  sortKey = '_id';

  constructor(@InjectModel(Flyer.name) model: Model<Flyer>) {
    super(model);
    this.migrateSizes();
  }

  override async getAll(params?: { first: number; rows: number }, filters?: FilterQuery<Flyer>) {
    let query = this.model.find(filters ?? {});

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query
      .populate('tags')
      .sort({ createdAt: -1 })
      .collation({ locale: 'pl', strength: 1 })
      .lean<FlyerDto[]>()
      .exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }

  async getAllWithReleases(
    params?: { first: number; rows: number },
    filters?: FilterQuery<Flyer>,
    sort?: Record<string, 1 | -1>
  ) {
    let query = this.model
      .find(filters ?? {})
      .populate('tags')
      .populate({ path: 'releases', populate: [{ path: 'film' }, { path: 'distributors' }] });

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query
      .sort(sort ?? { createdAt: -1 })
      .collation({ locale: 'pl', strength: 1 })
      .lean<FlyerDto[]>()
      .exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }

  async migrateSizes() {
    console.log('Start size migration');
    const operations = migrationFlyerSizes.map((entry) => ({
      updateMany: {
        filter: { size: entry.value },
        update: {
          $set: {
            size: entry.newValue,
            orientation: entry.orientation,
          },
        },
      },
    }));

    const result = await this.model.bulkWrite(operations);

    console.log('Size migration done:', {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }
}
