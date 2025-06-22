import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserFlyerDocument = HydratedDocument<UserFlyer>;

@Schema()
export class UserFlyer {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'Flyer' })
  flyer: Types.ObjectId;

  @Prop({ required: true })
  collection: boolean;

  @Prop({ required: true })
  exchange: boolean;

  @Prop({ required: true })
  wanted: boolean;

  @Prop({ required: true })
  notInterested: boolean;

  @Prop({ required: true })
  count: number;
}

export const UserSchema = SchemaFactory.createForClass(UserFlyer);
