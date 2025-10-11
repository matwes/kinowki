import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FlyerModule } from '../flyer/flyer.module';
import { UserFlyerModule } from '../user-flyer/user-flyer.module';
import { Release, ReleaseSchema } from './release.schema';
import { ReleaseService } from './release.service';
import { ReleaseController } from './release.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Release.name, schema: ReleaseSchema }]), FlyerModule, UserFlyerModule],
  exports: [ReleaseService],
  controllers: [ReleaseController],
  providers: [ReleaseService],
})
export class ReleaseModule {}
