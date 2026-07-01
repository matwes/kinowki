import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { FilmModule } from './film/film.module';
import { ReleaseModule } from './release/release.module';
import { DistributorModule } from './distributor/distributor.module';
import { FlyerModule } from './flyer/flyer.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { UserFlyerModule } from './user-flyer/user-flyer.module';
import { UserOfferModule } from './user-offer/user-offer.module';
import { UnmarkedFlyersModule } from './unmarked-flyers/unmarked-flyers.module';
import { FilmGroupModule } from './film-group/film-group.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL ?? '', { dbName: 'kinowki', autoIndex: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    DistributorModule,
    FilmGroupModule,
    FilmModule,
    FlyerModule,
    ReleaseModule,
    TagModule,
    UnmarkedFlyersModule,
    UserFlyerModule,
    UserModule,
    UserOfferModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
