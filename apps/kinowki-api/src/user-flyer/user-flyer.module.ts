import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';
import { UserFlyer, UserFlyerSchema } from './user-flyer.schema';
import { UserFlyerService } from './user-flyer.service';
import { UserFlyerController } from './user-flyer.controller';
import { UserOfferModule } from '../user-offer/user-offer.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserFlyer.name, schema: UserFlyerSchema }]),
    UserModule,
    UserOfferModule,
  ],
  controllers: [UserFlyerController],
  providers: [UserFlyerService],
  exports: [UserFlyerService],
})
export class UserFlyerModule {}
