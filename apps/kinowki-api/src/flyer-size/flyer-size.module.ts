import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FlyerSize, FlyerSizeSchema } from './flyer-size.schema';
import { FlyerSizeService } from './flyer-size.service';
import { FlyerSizeController } from './flyer-size.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FlyerSize.name, schema: FlyerSizeSchema }])],
  controllers: [FlyerSizeController],
  providers: [FlyerSizeService],
})
export class FlyerSizeModule {}
