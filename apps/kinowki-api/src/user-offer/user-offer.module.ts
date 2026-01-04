import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';
import { UserOffer, UserOfferSchema } from './user-offer.schema';
import { UserOfferService } from './user-offer.service';
import { UserOfferController } from './user-offer.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserOffer.name, schema: UserOfferSchema }]), UserModule],
  providers: [UserOfferService],
  exports: [UserOfferService],
  controllers: [UserOfferController],
})
export class UserOfferModule {}
