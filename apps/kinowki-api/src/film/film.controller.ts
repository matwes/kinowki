import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { CreateFilmDto, UpdateFilmDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { Film } from './film.schema';
import { FilmService } from './film.service';

@Controller('film')
export class FilmController extends CrudController<Film, CreateFilmDto, UpdateFilmDto> {
  name = 'film';

  constructor(filmService: FilmService) {
    super(filmService);
  }

  @Get()
  override async getAll(
    @Res() response,
    @Query('first') first?: number,
    @Query('rows') rows?: number,
    @Query('title') title?: string,
    @Query('genres') genres?: string
  ) {
    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const filters: FilterQuery<Film> = {
        ...(title ? { title: { $regex: new RegExp(title, 'i') } } : {}),
        ...(genres ? { genres: { $all: genres.split(',').map((g) => Number(g)) } } : {}),
      };

      const [data, totalRecords] = await Promise.all([
        this.crudService.getAll(params, filters),
        this.crudService.count(filters),
      ]);
      return response.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data,
        totalRecords,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }
}
