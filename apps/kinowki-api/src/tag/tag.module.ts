import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Tag, TagSchema } from './tag.schema';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
