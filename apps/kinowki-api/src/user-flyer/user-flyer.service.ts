import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import {
  CreateUserFlyerDto,
  FlyerDto,
  UpdateUserFlyerDto,
  UserFlyerDto,
  UserFlyerFilter,
  UserFlyerStatus,
} from '@kinowki/shared';
import { CrudService } from '../utils';
import { UserFlyer } from './user-flyer.schema';
import { UserService } from '../user/user.service';
import { UserOfferService } from '../user-offer/user-offer.service';

@Injectable()
export class UserFlyerService extends CrudService<UserFlyer, UserFlyerDto, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user flyer';
  sortKey = 'flyer';

  constructor(
    @InjectModel(UserFlyer.name) model: Model<UserFlyer>,
    private readonly userService: UserService,
    private readonly userOfferService: UserOfferService
  ) {
    super(model);

    // this.migrateRemoveOrphanUserFlyers();
    // this.migrateCreateInitialUserOffers();
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

  async getAllWithReleases(
    state: UserFlyerFilter,
    userId: string,
    loggedUserId?: string,
    params?: { first: number; rows: number }
  ) {
    if ((state === UserFlyerFilter.TRADE_MATCH || state === UserFlyerFilter.WANT_MATCH) && loggedUserId) {
      const userTrade = new Types.ObjectId(state === UserFlyerFilter.TRADE_MATCH ? userId : loggedUserId);
      const userWant = new Types.ObjectId(state === UserFlyerFilter.TRADE_MATCH ? loggedUserId : userId);

      const totalRecords = await this.userOfferService.getOfferCount(userTrade, userWant);

      if (!totalRecords) {
        return {
          data: [],
          totalRecords: 0,
        };
      }

      const result = await this.model
        .aggregate([
          { $match: { user: userTrade, status: UserFlyerStatus.TRADE } },
          {
            $lookup: {
              from: 'userflyers',
              let: { flyerId: '$flyer' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$flyer', '$$flyerId'] },
                        { $eq: ['$user', userWant] },
                        { $eq: ['$status', UserFlyerStatus.WANT] },
                      ],
                    },
                  },
                },
                { $limit: 1 },
                { $project: { _id: 1 } },
              ],
              as: 'match',
            },
          },
          { $match: { match: { $ne: [] } } },
          { $unset: 'match' },
          { $sort: { flyerName: -1 } },
          ...(params ? [{ $skip: params.first }, { $limit: params.rows }] : []),
          {
            $lookup: {
              from: 'flyers',
              localField: 'flyer',
              foreignField: '_id',
              as: 'flyer',
            },
          },
          { $unwind: '$flyer' },
          {
            $lookup: {
              from: 'tags',
              localField: 'flyer.tags',
              foreignField: '_id',
              as: 'flyer.tags',
            },
          },
          {
            $lookup: {
              from: 'releases',
              let: { releaseIds: '$flyer.releases' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$releaseIds'] } } },
                {
                  $lookup: {
                    from: 'films',
                    localField: 'film',
                    foreignField: '_id',
                    as: 'film',
                  },
                },
                { $unwind: { path: '$film', preserveNullAndEmptyArrays: true } },
              ],
              as: 'flyer.releases',
            },
          },
        ])
        .collation({ locale: 'pl', strength: 1 });

      return {
        data: result as UserFlyerDto[],
        totalRecords,
      };
    } else {
      const filters: FilterQuery<UserFlyer> = { user: new Types.ObjectId(userId) };

      if (state === UserFlyerFilter.HAVE) {
        filters.status = { $lt: UserFlyerStatus.WANT };
      } else if (state === UserFlyerFilter.TRADE) {
        filters.status = UserFlyerStatus.TRADE;
      } else {
        filters.status = UserFlyerStatus.WANT;
      }

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

      const [data, totalRecords] = await Promise.all([
        query.collation({ locale: 'pl', strength: 1 }).lean<UserFlyerDto[]>().exec(),
        this.count(filters),
      ]);
      if (!data) {
        throw new NotFoundException(`${this.name} data not found!`);
      }

      return {
        data,
        totalRecords,
      };
    }
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

  async updateUserOffer(userTrade: Types.ObjectId | string, userWant: Types.ObjectId | string) {
    const result = await this.model.aggregate([
      { $match: { user: new Types.ObjectId(userTrade), status: UserFlyerStatus.TRADE } },
      {
        $lookup: {
          from: 'userflyers',
          let: { flyer: '$flyer' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$flyer', '$$flyer'] },
                    { $eq: ['$user', new Types.ObjectId(userWant)] },
                    { $eq: ['$status', UserFlyerStatus.WANT] },
                  ],
                },
              },
            },
          ],
          as: 'wanted',
        },
      },
      { $match: { wanted: { $ne: [] } } },
      { $count: 'count' },
    ]);

    return this.userOfferService.createOrUpdate(userTrade, userWant, result[0]?.count ?? 0);
  }

  async updateUserOffers(user: Types.ObjectId | string) {
    const users = await this.userService.getAll();

    for (const otherUser of users) {
      if (otherUser._id.toString() !== user.toString()) {
        await this.updateUserOffer(user, otherUser._id);
        await this.updateUserOffer(otherUser._id, user);
      }
    }
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

  async migrateCreateInitialUserOffers() {
    console.log('Starting migration: creating user offers...');

    const users = await this.userService.getAll();

    for (const userTrade of users) {
      for (const userWant of users) {
        if (userTrade._id.toString() !== userWant._id.toString()) {
          await this.updateUserOffer(userTrade._id, userWant._id);
        }
      }
    }

    console.log('✅ Migration finished. Created/updated user offers.');
  }
}
