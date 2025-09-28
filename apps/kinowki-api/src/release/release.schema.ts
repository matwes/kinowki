import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type ReleaseDocument = HydratedDocument<Release>;

@Schema()
export class Release {
  @Prop({ required: true, index: true })
  date: string;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'Film' })
  film: Types.ObjectId;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: 'Distributor' })
  distributors: Types.ObjectId[];

  @Prop({ required: true })
  releaseType: number;

  @Prop()
  note?: string;
}

export const ReleaseSchema = SchemaFactory.createForClass(Release);
