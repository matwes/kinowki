import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { FilmModule } from './film/film.module';
import { ReleaseModule } from './release/release.module';
import { DistributorModule } from './distributor/distributor.module';
import { FlyerModule } from './flyer/flyer.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { UserFlyerModule } from './user-flyer/user-flyer.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL, { dbName: 'kinowki' }),
    ScheduleModule.forRoot(),
    DistributorModule,
    FilmModule,
    FlyerModule,
    ReleaseModule,
    TagModule,
    UserFlyerModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
