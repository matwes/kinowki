import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FlyerSizeDocument = HydratedDocument<FlyerSize>;

@Schema()
export class FlyerSize {
  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop()
  name?: string;
}

export const FlyerSizeSchema = SchemaFactory.createForClass(FlyerSize);
