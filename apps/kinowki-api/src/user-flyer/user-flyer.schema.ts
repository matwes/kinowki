import { UserFlyerStatus } from '@kinowki/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserFlyerDocument = HydratedDocument<UserFlyer>;

@Schema()
export class UserFlyer {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Flyer', required: true })
  flyer: Types.ObjectId;

  @Prop({ type: String, required: true })
  flyerName: string;

  @Prop({ type: Number, enum: UserFlyerStatus, default: UserFlyerStatus.UNWANTED })
  status: UserFlyerStatus;

  @Prop()
  note?: string;
}

export const UserFlyerSchema = SchemaFactory.createForClass(UserFlyer)
  .index({ user: 1, flyer: 1 }, { unique: true })
  .index({ user: 1, status: 1 })
  .index({ flyer: 1, user: 1, status: 1 })
  .index({ flyer: 1, status: 1 });
