import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

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
    let query = this.model.find(filters).populate('distributors');

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query.sort({ date: 1 }).lean().exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }

  async getAllWithFilms(
    params?: { first: number; rows: number },
    filters?: FilterQuery<Release>,
    revertDateSort = false
  ) {
    const filmFilter = filters?.['film.title'] ? { ['film.title']: filters?.['film.title'] } : undefined;
    delete filters?.['film.title'];

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
        ...(filmFilter && Object.keys(filmFilter).length > 0 ? [{ $match: filmFilter }] : []),
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
            date: revertDateSort ? -1 : 1,
            'film.title': 1,
          },
        },
        ...(params ? [{ $skip: params.first }, { $limit: params.rows }] : []),
      ])
      .collation({ locale: 'pl', strength: 1 })
      .exec();

    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }

    return itemData;
  }

  async getDistributorsStats(distributorId: Types.ObjectId) {
    const today = new Date().toISOString().slice(0, 10);

    const data: {
      releasesCount: number;
      totalPastReleases: number;
      totalPastWithFlyers: number;
      firstYear: number;
      lastYear: number;
    } = (
      await this.model.aggregate([
        { $match: { distributors: distributorId } },
        {
          $facet: {
            all: [{ $count: 'releasesCount' }],
            past: [{ $match: { date: { $lt: today } } }, { $count: 'totalPastReleases' }],
            pastWithFlyers: [
              { $match: { date: { $lt: today } } },
              { $lookup: { from: 'flyers', localField: '_id', foreignField: 'releases', as: 'flyers' } },
              { $match: { 'flyers.0': { $exists: true } } },
              { $count: 'totalPastWithFlyers' },
            ],
            years: [
              {
                $group: {
                  _id: null,
                  first: { $min: { $substr: ['$date', 0, 4] } },
                  last: { $max: { $substr: ['$date', 0, 4] } },
                },
              },
            ],
          },
        },
        {
          $project: {
            releasesCount: { $ifNull: [{ $arrayElemAt: ['$all.releasesCount', 0] }, 0] },
            totalPastReleases: { $ifNull: [{ $arrayElemAt: ['$past.totalPastReleases', 0] }, 0] },
            totalPastWithFlyers: { $ifNull: [{ $arrayElemAt: ['$pastWithFlyers.totalPastWithFlyers', 0] }, 0] },
            firstYear: {
              $cond: [{ $gt: [{ $size: '$years' }, 0] }, { $toInt: { $arrayElemAt: ['$years.first', 0] } }, null],
            },
            lastYear: {
              $cond: [{ $gt: [{ $size: '$years' }, 0] }, { $toInt: { $arrayElemAt: ['$years.last', 0] } }, null],
            },
          },
        },
      ])
    )[0];

    return data;
  }

  async getDistributorFlyerProbability(distributorId: Types.ObjectId) {
    const today = new Date().toISOString().slice(0, 10);

    const data: { _id: Types.ObjectId; hasFlyer: boolean }[] = await this.model.aggregate([
      { $match: { distributors: { $in: [distributorId] }, date: { $lt: today } } },
      { $sort: { date: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'flyers', localField: '_id', foreignField: 'releases', as: 'flyers' } },
      { $project: { hasFlyer: { $gt: [{ $size: '$flyers' }, 0] } } },
    ]);

    return data.length ? Math.floor((data.filter((release) => release.hasFlyer).length / data.length) * 100) : 0;
  }
}
