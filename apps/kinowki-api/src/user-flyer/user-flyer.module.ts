import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserFlyer, UserSchema } from './schemas/user-flyer.schema';
import { UserFlyerService } from './user-flyer.service';
import { UserFlyerController } from './user-flyer.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserFlyer.name, schema: UserSchema }])],
  controllers: [UserFlyerController],
  providers: [UserFlyerService],
})
export class UserFlyerModule {}
