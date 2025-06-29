import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag {
  @Prop({ required: true, index: true })
  name: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
