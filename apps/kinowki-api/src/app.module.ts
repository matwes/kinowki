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

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL, { dbName: 'kinowki', autoIndex: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    DistributorModule,
    FilmModule,
    FlyerModule,
    ReleaseModule,
    TagModule,
    UserFlyerModule,
    UserModule,
    UserOfferModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
