import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserFlyerModule } from '../user-flyer/user-flyer.module';
import { UserModule } from '../user/user.module';
import { Flyer, FlyerSchema } from './flyer.schema';
import { FlyerService } from './flyer.service';
import { FlyerController } from './flyer.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Flyer.name, schema: FlyerSchema }]), UserFlyerModule, UserModule],
  exports: [FlyerService],
  controllers: [FlyerController],
  providers: [FlyerService],
})
export class FlyerModule {}
