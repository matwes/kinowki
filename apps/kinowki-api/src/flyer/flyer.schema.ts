import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Image, ImageSchema } from '../utils';

export type FlyerDocument = HydratedDocument<Flyer>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Flyer {
  @Prop({ required: true, index: true, unique: true })
  id: string;

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

export const FlyerSchema = SchemaFactory.createForClass(Flyer).index({ createdAt: -1 });
