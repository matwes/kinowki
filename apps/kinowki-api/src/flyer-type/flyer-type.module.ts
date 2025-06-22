import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FlyerType, FlyerTypeSchema } from './schemas/flyer-type.schema';
import { FlyerTypeService } from './flyer-type.service';
import { FlyerTypeController } from './flyer-type.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FlyerType.name, schema: FlyerTypeSchema }])],
  controllers: [FlyerTypeController],
  providers: [FlyerTypeService],
})
export class FlyerTypeModule {}
