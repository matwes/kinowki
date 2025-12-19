import { Controller, Get, HttpStatus, ParseIntPipe, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { CreateFilmDto, FilmDto, UpdateFilmDto } from '@kinowki/shared';
import { UserData } from '../auth/jwt-strategy';
import { FlyerService } from '../flyer/flyer.service';
import { ReleaseService } from '../release/release.service';
import { UserFlyerService } from '../user-flyer/user-flyer.service';
import { CrudController, errorHandler, getRegex, OptionalJwtAuthGuard, sortFlyers } from '../utils';
import { Film } from './film.schema';
import { FilmService } from './film.service';

@Controller('film')
export class FilmController extends CrudController<Film, FilmDto, CreateFilmDto, UpdateFilmDto> {
  name = 'film';

  constructor(
    filmService: FilmService,
    private readonly releaseService: ReleaseService,
    private readonly flyerService: FlyerService,
    private readonly userFlyerService: UserFlyerService
  ) {
    super(filmService);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  override async getAll(
    @Req() req,
    @Res() res: Response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('title') title?: string,
    @Query('genres') genres?: string,
    @Query('letter') letter?: string
  ) {
    const userData = req.user as UserData | null;

    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const filters: FilterQuery<Film> = {
        ...(letter ? { firstLetter: letter.toUpperCase() } : {}),
        ...(title
          ? { $or: [{ title: { $regex: getRegex(title) } }, { originalTitle: { $regex: getRegex(title) } }] }
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
              const flyers = (await this.flyerService.getAll(undefined, { releases: release._id })).sort(sortFlyers);
              flyerCount += flyers.length;

              if (userData?.userId && flyers.length) {
                await this.userFlyerService.addUserStatus(userData.userId, flyers);
              }

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

      res.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data: extendedData,
        totalRecords,
      });
    } catch (err) {
      errorHandler(res, err, 'Getting films');
    }
  }
}
