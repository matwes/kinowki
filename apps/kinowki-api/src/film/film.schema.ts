import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FilmDocument = HydratedDocument<Film>;

@Schema()
export class Film {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  originalTitle?: string;

  @Prop({ required: true })
  firstLetter: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  genres: number[];

  @Prop({ required: false })
  imdb?: number;
}

export const FilmSchema = SchemaFactory.createForClass(Film)
  .index({ firstLetter: 1 }, { unique: false, collation: { locale: 'pl', strength: 1 } })
  .index({ genres: 1 })
  .index({ imdb: 1 }, { unique: true, partialFilterExpression: { imdb: { $type: 'number' } } })
  .index({ title: 1 }, { unique: false, collation: { locale: 'pl', strength: 1 } });
