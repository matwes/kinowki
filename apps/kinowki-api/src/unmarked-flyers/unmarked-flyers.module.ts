import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { FlyerModule } from '../flyer/flyer.module';
import { UnmarkedFlyersController } from './unmarked-flyers.controller';
import { UserFlyerModule } from '../user-flyer/user-flyer.module';

@Module({
  imports: [UserModule, FlyerModule, UserFlyerModule],
  controllers: [UnmarkedFlyersController],
})
export class UnmarkedFlyersModule {}
