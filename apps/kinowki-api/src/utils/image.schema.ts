import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
  original: string;

  @Prop()
  thumbnail?: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
