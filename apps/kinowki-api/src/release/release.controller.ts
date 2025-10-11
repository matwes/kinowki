import { Controller, Get, HttpStatus, ParseIntPipe, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FilterQuery, Types } from 'mongoose';

import { CreateReleaseDto, ReleaseDto, UpdateReleaseDto } from '@kinowki/shared';
import { FlyerService } from '../flyer/flyer.service';
import { CrudController, getRegex, OptionalJwtAuthGuard } from '../utils';
import { Release } from './release.schema';
import { ReleaseService } from './release.service';
import { UserData } from '../auth/jwt-strategy';
import { UserFlyerService } from '../user-flyer/user-flyer.service';

@Controller('release')
export class ReleaseController extends CrudController<Release, ReleaseDto, CreateReleaseDto, UpdateReleaseDto> {
  name = 'release';

  constructor(
    protected releaseService: ReleaseService,
    private readonly flyerService: FlyerService,
    private readonly userFlyerService: UserFlyerService
  ) {
    super(releaseService);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  override async getAll(
    @Req() req,
    @Res() response: Response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
    @Query('film') film?: string,
    @Query('distributor') distributor?: string
  ) {
    const userData = req.user as UserData | null;

    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const filters: FilterQuery<Release> = {};
      let revertDateSort = false;

      if (year && month !== undefined && month !== null) {
        month++;
        const monthStr = String(month).padStart(2, '0');
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const nextMonthStr = String(nextMonth).padStart(2, '0');

        filters.date = {
          $gte: `${year}-${monthStr}-00`,
          $lt: `${nextYear}-${nextMonthStr}-00`,
        };
      }
      if (film) {
        filters['film.title'] = { $regex: getRegex(film) };
      }
      if (distributor) {
        filters['distributors'] = new Types.ObjectId(distributor);
        revertDateSort = true;
      }

      const [data, totalRecords] = await Promise.all([
        this.releaseService.getAllWithFilms(params, filters, revertDateSort),
        this.crudService.count(filters),
      ]);

      const extendedData = await Promise.all(
        data.map(async (release) => {
          const flyers = (await this.flyerService.getAll(undefined, { releases: release._id })).sort((a, b) =>
            a.type !== b.type ? a.type - b.type : a.size - b.size
          );

          if (userData?.userId && flyers.length) {
            await this.userFlyerService.addUserStatus(userData.userId, flyers);
          }

          release.flyers = flyers;

          return release;
        })
      );

      response.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data: extendedData,
        totalRecords,
      });
    } catch (err) {
      response.status(err.status).json(err.response);
    }
  }
}
