import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateUserOfferDto, UpdateUserOfferDto, UserOfferDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { UserOffer } from './user-offer.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class UserOfferService extends CrudService<UserOffer, UserOfferDto, CreateUserOfferDto, UpdateUserOfferDto> {
  name = 'user offer';
  sortKey = '_id';

  constructor(@InjectModel(UserOffer.name) model: Model<UserOffer>, private userService: UserService) {
    super(model);
  }

  async getOfferCount(userTrade: Types.ObjectId | string, userWant: Types.ObjectId | string) {
    return (await this.model.findOne({ userTrade, userWant }).lean<UserOfferDto>().exec())?.count ?? 0;
  }

  async createOrUpdate(userTrade: Types.ObjectId | string, userWant: Types.ObjectId | string, count: number) {
    return await this.model
      .updateOne({ userTrade, userWant }, { $set: { userTrade, userWant, count } }, { upsert: true })
      .exec();
  }
}
