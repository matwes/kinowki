import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DistributorDocument = HydratedDocument<Distributor>;

@Schema()
export class Distributor {
  @Prop({ required: true, index: true, unique: true })
  name: string;

  @Prop({ index: true })
  releasesCount: number;

  @Prop()
  pastReleasesCount: number;

  @Prop()
  pastReleasesWithFlyersCount: number;

  @Prop()
  pastReleasesWithFlyersPercent: number;

  @Prop()
  flyerProbability: number;

  @Prop()
  firstYear: number;

  @Prop()
  lastYear: number;
}

export const DistributorSchema = SchemaFactory.createForClass(Distributor);
