import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FlyerModule } from '../flyer/flyer.module';
import { ReleaseModule } from '../release/release.module';
import { UserFlyerModule } from '../user-flyer/user-flyer.module';
import { Film, FilmSchema } from './film.schema';
import { FilmService } from './film.service';
import { FilmController } from './film.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
    ReleaseModule,
    FlyerModule,
    UserFlyerModule,
  ],
  controllers: [FilmController],
  providers: [FilmService],
})
export class FilmModule {}
