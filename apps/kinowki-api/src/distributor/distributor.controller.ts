import { Controller, Get, HttpStatus, ParseIntPipe, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { CreateDistributorDto, DistributorDto, UpdateDistributorDto } from '@kinowki/shared';
import { CrudController, getRegex } from '../utils';
import { Distributor } from './distributor.schema';
import { DistributorService } from './distributor.service';

@Controller('distributor')
export class DistributorController extends CrudController<
  Distributor,
  DistributorDto,
  CreateDistributorDto,
  UpdateDistributorDto
> {
  name = 'distributor';

  constructor(distributorService: DistributorService) {
    super(distributorService);
  }

  @Get()
  override async getAll(
    @Req() req,
    @Res() res: Response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('name') name?: string
  ) {
    try {
      const params = rows ? { first: Number(first) || 0, rows: Number(rows) } : undefined;
      const filters: FilterQuery<Distributor> = {
        ...(name ? { name: { $regex: getRegex(name) } } : {}),
      };

      const [data, totalRecords] = await Promise.all([
        this.crudService.getAll(params, filters),
        this.crudService.count(filters),
      ]);
      res.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data,
        totalRecords,
      });
    } catch (err) {
      res.status(err.status).json(err.response);
    }
  }
}
