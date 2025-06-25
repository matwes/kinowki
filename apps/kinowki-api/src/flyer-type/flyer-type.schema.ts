import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FlyerTypeDocument = HydratedDocument<FlyerType>;

@Schema()
export class FlyerType {
  @Prop({ required: true, index: true })
  name: string;
}

export const FlyerTypeSchema = SchemaFactory.createForClass(FlyerType);
