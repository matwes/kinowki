import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Image, ImageSchema } from '../utils';

export type FlyerDocument = HydratedDocument<Flyer>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Flyer {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  type?: number;

  @Prop()
  size?: number;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: 'Tag' })
  tags: Types.ObjectId[];

  @Prop()
  note?: string;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: 'Release' })
  releases: Types.ObjectId[];

  @Prop({ type: [ImageSchema], default: [] })
  images: Image[];

  @Prop()
  createdAt: Date;
}

export const FlyerSchema = SchemaFactory.createForClass(Flyer)
  .index({ createdAt: -1 })
  .index({ id: 1 }, { unique: true })
  .index({ type: 1 })
  .index({ size: 1 })
  .index({ tags: 1 });
