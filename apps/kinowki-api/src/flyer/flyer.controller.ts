import { Controller, Get, HttpStatus, ParseIntPipe, Query, Res } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { CreateFlyerDto, UpdateFlyerDto } from '@kinowki/shared';
import { CrudController, getRegex } from '../utils';
import { Flyer } from './flyer.schema';
import { FlyerService } from './flyer.service';

@Controller('flyer')
export class FlyerController extends CrudController<Flyer, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';

  constructor(protected flyerService: FlyerService) {
    super(flyerService);
  }

  @Get()
  override async getAll(
    @Res() response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('id') id?: string,
    @Query('flyerType') flyerType?: string,
    @Query('flyerSize') flyerSize?: string,
    @Query('flyerTags') flyerTags?: string
  ) {
    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const filters: FilterQuery<Flyer> = {
        ...(id ? { id: { $regex: getRegex(id) } } : {}),
        ...(flyerType ? { type: flyerType } : {}),
        ...(flyerSize ? { size: flyerSize } : {}),
        ...(flyerTags ? { tags: flyerTags } : {}),
      };

      const [data, totalRecords] = await Promise.all([
        this.flyerService.getAllWithReleases(params, filters),
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
