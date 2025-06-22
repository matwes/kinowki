import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Distributor, DistributorSchema } from './schemas/distributor.schema';
import { DistributorService } from './distributor.service';
import { DistributorController } from './distributor.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Distributor.name, schema: DistributorSchema }])],
  controllers: [DistributorController],
  providers: [DistributorService],
})
export class DistributorModule {}
