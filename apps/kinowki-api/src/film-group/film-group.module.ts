import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FilmGroup, FilmGroupSchema } from './film-group.schema';
import { FilmGroupService } from './film-group.service';
import { FilmGroupController } from './film-group.controller';
import { FilmModule } from '../film/film.module';
import { ReleaseModule } from '../release/release.module';
import { FlyerModule } from '../flyer/flyer.module';
import { UserFlyerModule } from '../user-flyer/user-flyer.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FilmGroup.name, schema: FilmGroupSchema }]),
    FilmModule,
    FlyerModule,
    ReleaseModule,
    UserFlyerModule,
  ],
  controllers: [FilmGroupController],
  providers: [FilmGroupService],
})
export class FilmGroupModule {}
