import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type FlyerDocument = HydratedDocument<Flyer>;

@Schema()
export class Flyer {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'FlyerType' })
  type: Types.ObjectId;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'FlyerSize' })
  size: Types.ObjectId;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: 'Tag' })
  tags: Types.ObjectId[];

  @Prop()
  note?: string;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: 'Release' })
  releases: Types.ObjectId[];
}

export const FlyerSchema = SchemaFactory.createForClass(Flyer);
