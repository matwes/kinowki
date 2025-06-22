import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type FilmDocument = HydratedDocument<Film>;

@Schema()
export class Film {
  @Prop({ required: true, index: true })
  title: string;

  @Prop({ required: false })
  originalTitle?: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: 'Genre' })
  genres: Types.ObjectId[];

  @Prop({ required: false })
  imdb?: number;
}

export const FilmSchema = SchemaFactory.createForClass(Film);
