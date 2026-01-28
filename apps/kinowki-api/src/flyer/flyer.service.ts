import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import {
  CreateFlyerDto,
  FlyerDto,
  flyerSizeMap,
  flyerTypeMap,
  ReleaseDto,
  releaseTypeMap,
  UpdateFlyerDto,
} from '@kinowki/shared';
import { CrudService } from '../utils';
import { Flyer } from './flyer.schema';

@Injectable()
export class FlyerService extends CrudService<Flyer, FlyerDto, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';
  sortKey = '_id';

  constructor(@InjectModel(Flyer.name) model: Model<Flyer>) {
    super(model);
    this.setFlyerNames();
  }

  override async getAll(params?: { first: number; rows: number }, filters?: FilterQuery<Flyer>) {
    let query = this.model.find(filters);

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query
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
      .find(filters)
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

  async setFlyerNames() {
    const flyers = await this.model
      .find()
      .populate({
        path: 'releases',
        populate: { path: 'film' },
      })
      .lean();

    const ops = flyers.map((flyer) => {
      const releases = flyer.releases as unknown as ReleaseDto[];
      const filterName = [
        ...releases.flatMap((release) => [release.film?.title, release.film?.originalTitle, release.note]),
        flyer.note,
      ]
        .filter(Boolean)
        .join(';');

      let sortName = '';

      if (releases.length) {
        const oldest = releases.reduce((oldest, current) => (current.date < oldest.date ? current : oldest));
        sortName = releases.map((release) => release.film.title).join(' | ');

        const tags = [
          ...(oldest.releaseType !== 1 && oldest.releaseType !== 5 ? [releaseTypeMap[oldest.releaseType]] : []),
          ...(oldest.note ? [oldest.note] : []),
          ...(!flyer.size || flyer.size === 1 ? [] : [flyerSizeMap[flyer.size]]),
          ...(!flyer.type || flyer.type === 1 ? [] : [flyerTypeMap[flyer.type]]),
          ...(flyer.note ? [flyer.note] : []),
        ];

        if (tags.length) {
          sortName += ` [${tags.join('] [')}]`;
        }
      }

      return {
        updateOne: {
          filter: { _id: flyer._id },
          update: {
            $set: { filterName, sortName },
            $unset: { id: '', name: '' },
          },
        },
      };
    });

    await this.model.bulkWrite(ops);
  }
}
