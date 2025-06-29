import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReleaseModule } from '../release/release.module';
import { Film, FilmSchema } from './film.schema';
import { FilmService } from './film.service';
import { FilmController } from './film.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]), ReleaseModule],
  controllers: [FilmController],
  providers: [FilmService],
})
export class FilmModule {}
