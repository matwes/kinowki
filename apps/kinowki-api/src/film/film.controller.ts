import { Controller, Get, HttpStatus, ParseIntPipe, Query, Res } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { CreateFilmDto, UpdateFilmDto } from '@kinowki/shared';
import { ReleaseService } from '../release/release.service';
import { CrudController } from '../utils';
import { Film } from './film.schema';
import { FilmService } from './film.service';

@Controller('film')
export class FilmController extends CrudController<Film, CreateFilmDto, UpdateFilmDto> {
  name = 'film';

  constructor(filmService: FilmService, private readonly releaseService: ReleaseService) {
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
                { title: { $regex: new RegExp(title, 'i') } },
                { originalTitle: { $regex: new RegExp(title, 'i') } },
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
        data.map(async (film) => ({
          ...film,
          releases: await this.releaseService.getAll(undefined, { film: film._id }),
        }))
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
