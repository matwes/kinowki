import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateUserFlyerDto, FlyerDto, UpdateUserFlyerDto, UserFlyerDto, UserFlyerStatus } from '@kinowki/shared';
import { CrudService } from '../utils';
import { UserFlyer } from './user-flyer.schema';

@Injectable()
export class UserFlyerService extends CrudService<UserFlyer, UserFlyerDto, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user flyer';
  sortKey = 'flyer';

  constructor(@InjectModel(UserFlyer.name) model: Model<UserFlyer>) {
    super(model);
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

  async addUserStatus(user: string, flyers: FlyerDto[]) {
    const userFlyers = await this.getAll(null, {
      user,
      flyer: { $in: flyers.map((flyer) => flyer._id) },
    });

    const userFlyerMap = Object.fromEntries(userFlyers.map((userFlyer) => [userFlyer.flyer.toString(), userFlyer]));

    flyers.forEach((flyer) => (flyer.userFlyer = userFlyerMap[flyer._id.toString()]));
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
}
