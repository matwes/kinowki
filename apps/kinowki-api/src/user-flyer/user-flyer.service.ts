import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { CreateUserFlyerDto, FlyerDto, UpdateUserFlyerDto, UserFlyerDto, UserFlyerStatus } from '@kinowki/shared';
import { CrudService } from '../utils';
import { UserFlyer } from './user-flyer.schema';

@Injectable()
export class UserFlyerService extends CrudService<UserFlyer, UserFlyerDto, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user flyer';
  sortKey = 'flyer';

  constructor(@InjectModel(UserFlyer.name) model: Model<UserFlyer>) {
    super(model);

    this.migrateRemoveOrphanUserFlyers();
  }

  override async create(createDto: CreateUserFlyerDto) {
    return (
      await this.model.findOneAndUpdate(
        {
          user: createDto.user,
          flyer: createDto.flyer,
        },
        { $set: createDto },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      )
    ).toObject<UserFlyerDto>();
  }

  updateFlyerName(flyer: string | Types.ObjectId, flyerName: string) {
    return this.model.updateMany({ flyer }, { $set: { flyerName } });
  }

  async getAllWithReleases(params?: { first: number; rows: number }, filters?: FilterQuery<UserFlyer>) {
    let query = this.model
      .find(filters)
      .populate({
        path: 'flyer',
        populate: [{ path: 'tags' }, { path: 'releases', populate: [{ path: 'film' }] }],
      })
      .sort({ flyerName: -1 });

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query.collation({ locale: 'pl', strength: 1 }).lean<UserFlyerDto[]>().exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }

  async importUserStatuses(userFlyers: UpdateUserFlyerDto[]) {
    if (!userFlyers.length) {
      return;
    }

    return this.model.bulkWrite(
      userFlyers.map((userFlyer) => ({
        updateOne: {
          filter: { user: userFlyer.user, flyer: userFlyer.flyer },
          update: userFlyer,
          upsert: true,
        },
      }))
    );
  }

  async addUserStatus(userId: string | undefined, flyers: FlyerDto[]) {
    const userFlyers = await this.getAll(null, { flyer: { $in: flyers.map((flyer) => flyer._id) } });

    const stats = {};
    for (const userFlyer of userFlyers) {
      const id = userFlyer.flyer.toString();
      if (!stats[id]) {
        stats[id] = { have: [], trade: [], want: [], userFlyer: undefined };
      }

      if (userFlyer.status === UserFlyerStatus.HAVE) {
        stats[id].have.push(userFlyer.user.toString());
      } else if (userFlyer.status === UserFlyerStatus.TRADE) {
        stats[id].trade.push(userFlyer.user.toString());
      } else if (userFlyer.status === UserFlyerStatus.WANT) {
        stats[id].want.push(userFlyer.user.toString());
      }

      if (userId && userFlyer.user.toString() === userId) {
        stats[id].userFlyer = userFlyer;
      }
    }

    flyers.forEach((flyer) => {
      const id = flyer._id.toString();
      const flyerStats = stats[id];

      flyer.have = flyerStats?.have ?? [];
      flyer.trade = flyerStats?.trade ?? [];
      flyer.want = flyerStats?.want ?? [];
      flyer.userFlyer = flyerStats?.userFlyer;
    });
  }

  async getUserFlyerStats(userId: string) {
    const result = await this.model.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    let tradeTotal = 0;
    let wantTotal = 0;
    let haveTotal = 0;

    for (const item of result) {
      switch (item._id) {
        case UserFlyerStatus.HAVE:
          haveTotal += item.count;
          break;
        case UserFlyerStatus.TRADE:
          tradeTotal = item.count;
          haveTotal += item.count;
          break;
        case UserFlyerStatus.WANT:
          wantTotal = item.count;
          break;
      }
    }

    return { tradeTotal, wantTotal, haveTotal };
  }

  async migrateUserFlyersFlyerName() {
    console.log('Starting migration: setting flyerName for UserFlyers...');

    const userFlyers = await this.model
      .find({ flyerName: { $exists: false } })
      .populate('flyer', 'name')
      .lean();

    console.log(`Found ${userFlyers.length} UserFlyers to update.`);

    let updated = 0;
    for (const userFlyer of userFlyers) {
      const flyer = userFlyer.flyer as unknown as FlyerDto | undefined;

      if (flyer && flyer.sortDate && flyer.sortName) {
        const flyerName = `${flyer.sortDate} ${flyer.sortName}`;

        await this.model.updateOne({ _id: userFlyer._id }, { $set: { flyerName } });
        updated++;
      }
    }

    console.log(`✅ Migration finished. Updated ${updated} records.`);
  }

  async migrateRemoveOrphanUserFlyers() {
    console.log('Starting migration: removing orphan UserFlyers...');

    const orphanIds = await this.model.aggregate([
      {
        $lookup: {
          from: 'flyers',
          localField: 'flyer',
          foreignField: '_id',
          as: 'flyerDoc',
        },
      },
      {
        $match: {
          flyerDoc: { $size: 0 },
        },
      },
      {
        $project: { _id: 1 },
      },
    ]);

    console.log(`Found ${orphanIds.length} orphan UserFlyers.`);

    if (orphanIds.length === 0) {
      console.log('✅ Nothing to delete.');
      return;
    }

    const result = await this.model.deleteMany({
      _id: { $in: orphanIds.map((d) => d._id) },
    });

    console.log(`✅ Migration finished. Deleted ${result.deletedCount} records.`);
  }
}
