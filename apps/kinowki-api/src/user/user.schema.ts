import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, index: true, unique: true })
  name: string;

  @Prop({ required: true, index: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  role: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: false })
  importUsed: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
