import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReleaseModule } from '../release/release.module';
import { Distributor, DistributorSchema } from './distributor.schema';
import { DistributorService } from './distributor.service';
import { DistributorController } from './distributor.controller';
import { DistributorSchedulerService } from './distributor-scheduler.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Distributor.name, schema: DistributorSchema }]), ReleaseModule],
  controllers: [DistributorController],
  providers: [DistributorService, DistributorSchedulerService],
})
export class DistributorModule {}
