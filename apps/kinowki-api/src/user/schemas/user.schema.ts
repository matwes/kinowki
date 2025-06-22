import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: 'UserFlyer' })
  flyers: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
