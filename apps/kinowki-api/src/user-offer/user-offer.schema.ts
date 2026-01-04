import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserOfferDocument = HydratedDocument<UserOffer>;

@Schema()
export class UserOffer {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  userTrade: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  userWant: Types.ObjectId;

  @Prop({ type: Number })
  count: number;
}

export const UserOfferSchema = SchemaFactory.createForClass(UserOffer)
  .index({ userTrade: 1, userWant: 1 }, { unique: true })
  .index({ userWant: 1, count: -1 })
  .index({ userTrade: 1, count: -1 });
