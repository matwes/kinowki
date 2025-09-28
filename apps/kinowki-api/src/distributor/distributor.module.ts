import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Distributor, DistributorSchema } from './distributor.schema';
import { DistributorService } from './distributor.service';
import { DistributorController } from './distributor.controller';
import { ReleaseModule } from '../release/release.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Distributor.name, schema: DistributorSchema }]), ReleaseModule],
  controllers: [DistributorController],
  providers: [DistributorService],
})
export class DistributorModule {}
