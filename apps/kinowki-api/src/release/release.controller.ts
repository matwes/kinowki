import { Controller, Get, HttpStatus, ParseIntPipe, Query, Res } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { CreateReleaseDto, UpdateReleaseDto } from '@kinowki/shared';
import { FlyerService } from '../flyer/flyer.service';
import { CrudController, getRegex } from '../utils';
import { Release } from './release.schema';
import { ReleaseService } from './release.service';

@Controller('release')
export class ReleaseController extends CrudController<Release, CreateReleaseDto, UpdateReleaseDto> {
  name = 'release';

  constructor(protected releaseService: ReleaseService, private readonly flyerService: FlyerService) {
    super(releaseService);
  }

  @Get()
  override async getAll(
    @Res() response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
    @Query('film') film?: string
  ) {
    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const filters: FilterQuery<Release> = {};
      if (year && month !== undefined && month !== null) {
        filters.date = {
          $gte: new Date(year, month, 1),
          $lt: new Date(year, month + 1, 1),
        };
      }
      if (film) {
        filters['film.title'] = { $regex: getRegex(film) };
      }

      const [data, totalRecords] = await Promise.all([
        this.releaseService.getAllWithFilms(params, filters),
        this.crudService.count(filters),
      ]);

      const extendedData = await Promise.all(
        data.map(async (release) => ({
          ...release,
          flyers: await this.flyerService.getAll(undefined, { releases: release._id }),
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
