import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FilmGroupDocument = HydratedDocument<FilmGroup>;

@Schema()
export class FilmGroup {
  @Prop({ required: true })
  name!: string;
}

export const FilmGroupSchema = SchemaFactory.createForClass(FilmGroup).index(
  { name: 1 },
  { unique: true, collation: { locale: 'pl', strength: 1 } }
);
