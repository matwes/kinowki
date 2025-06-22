import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmModule } from './film/film.module';
import { ReleaseModule } from './release/release.module';
import { DistributorModule } from './distributor/distributor.module';
import { FlyerModule } from './flyer/flyer.module';
import { TagModule } from './tag/tag.module';
import { GenreModule } from './genre/genre.module';
import { FlyerTypeModule } from './flyer-type/flyer-type.module';
import { FlyerSizeModule } from './flyer-size/flyer-size.module';
import { UserModule } from './user/user.module';
import { UserFlyerModule } from './user-flyer/user-flyer.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/kinowki'),
    DistributorModule,
    FilmModule,
    FlyerModule,
    FlyerSizeModule,
    FlyerTypeModule,
    GenreModule,
    ReleaseModule,
    TagModule,
    UserFlyerModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
