import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DistributorDocument = HydratedDocument<Distributor>;

@Schema()
export class Distributor {
  @Prop({ required: true, index: true, unique: true })
  name: string;
}

export const DistributorSchema = SchemaFactory.createForClass(Distributor);
