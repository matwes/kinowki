import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { CreateReleaseDto, UpdateReleaseDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Release } from './release.schema';

@Injectable()
export class ReleaseService extends CrudService<Release, CreateReleaseDto, UpdateReleaseDto> {
  name = 'release';
  sortKey = 'date';

  constructor(@InjectModel(Release.name) model: Model<Release>) {
    super(model);
  }

  override async getAll(params?: { first: number; rows: number }, filters?: FilterQuery<Release>) {
    const itemData = await this.model
      .aggregate([
        ...(filters && Object.keys(filters).length > 0 ? [{ $match: filters }] : []),
        {
          $lookup: {
            from: 'films',
            localField: 'film',
            foreignField: '_id',
            as: 'film',
          },
        },
        { $unwind: { path: '$film', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'distributors',
            localField: 'distributors',
            foreignField: '_id',
            as: 'distributors',
          },
        },
        {
          $sort: {
            date: 1,
            'film.title': 1,
          },
        },
        ...(params ? [{ $skip: params.first }, { $limit: params.rows }] : []),
      ])
      .collation({ locale: 'pl', strength: 2 })
      .exec();

    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }

    return itemData;
  }
}
