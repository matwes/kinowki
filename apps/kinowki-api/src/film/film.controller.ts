import { Controller, Get, HttpStatus, ParseIntPipe, Query, Res } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { CreateFilmDto, UpdateFilmDto } from '@kinowki/shared';
import { FlyerService } from '../flyer/flyer.service';
import { ReleaseService } from '../release/release.service';
import { CrudController, getRegex } from '../utils';
import { Film } from './film.schema';
import { FilmService } from './film.service';

@Controller('film')
export class FilmController extends CrudController<Film, CreateFilmDto, UpdateFilmDto> {
  name = 'film';

  constructor(
    filmService: FilmService,
    private readonly releaseService: ReleaseService,
    private readonly flyerService: FlyerService
  ) {
    super(filmService);
  }

  @Get()
  override async getAll(
    @Res() response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('title') title?: string,
    @Query('genres') genres?: string
  ) {
    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const filters: FilterQuery<Film> = {
        ...(title
          ? {
              $or: [
                {
                  title: { $regex: getRegex(title) },
                },
                {
                  originalTitle: { $regex: getRegex(title) },
                },
              ],
            }
          : {}),
        ...(genres ? { genres: { $all: genres.split(',').map((g) => Number(g)) } } : {}),
      };

      const [data, totalRecords] = await Promise.all([
        this.crudService.getAll(params, filters),
        this.crudService.count(filters),
      ]);

      const extendedData = await Promise.all(
        data.map(async (film) => {
          const releases = await this.releaseService.getAll(undefined, { film: film._id });

          let flyerCount = 0;

          const releasesWithFlyers = await Promise.all(
            releases.map(async (release) => {
              const flyers = (await this.flyerService.getAll(undefined, { releases: release._id })).sort((a, b) =>
                a.type !== b.type ? a.type - b.type : a.size - b.size
              );
              flyerCount += flyers.length;

              return {
                ...release,
                flyers,
              };
            })
          );

          return {
            ...film,
            releases: releasesWithFlyers,
            flyerCount,
          };
        })
      );

      return response.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data: extendedData,
        totalRecords,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }
}
