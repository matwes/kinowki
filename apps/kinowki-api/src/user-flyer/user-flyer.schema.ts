import { UserFlyerStatus } from '@kinowki/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserFlyerDocument = HydratedDocument<UserFlyer>;

@Schema()
export class UserFlyer {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Flyer', required: true, index: true })
  flyer: Types.ObjectId;

  @Prop({ type: Number, enum: UserFlyerStatus, default: UserFlyerStatus.UNWANTED })
  status: UserFlyerStatus;

  @Prop()
  note?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserFlyer)
  .index({ user: 1, flyer: 1 }, { unique: true })
  .index({ flyer: 1, status: 1 });
