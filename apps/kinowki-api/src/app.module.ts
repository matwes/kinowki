import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { ServeStaticModule } from '@nestjs/serve-static';

import { FilmModule } from './film/film.module';
import { ReleaseModule } from './release/release.module';
import { DistributorModule } from './distributor/distributor.module';
import { FlyerModule } from './flyer/flyer.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { UserFlyerModule } from './user-flyer/user-flyer.module';
// import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URL, { dbName: 'kinowki' }),
    // ServeStaticModule.forRoot({ rootPath: join(__dirname, '../../../../flyers'), serveRoot: '/api/flyers' }),
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
