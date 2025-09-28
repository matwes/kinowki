import { Controller, Get, HttpStatus, ParseIntPipe, Query, Res } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { CreateDistributorDto, UpdateDistributorDto } from '@kinowki/shared';
import { CrudController, getRegex } from '../utils';
import { Distributor } from './distributor.schema';
import { DistributorService } from './distributor.service';
import { ReleaseService } from '../release/release.service';

@Controller('distributor')
export class DistributorController extends CrudController<Distributor, CreateDistributorDto, UpdateDistributorDto> {
  name = 'distributor';

  constructor(distributorService: DistributorService, private readonly releaseService: ReleaseService) {
    super(distributorService);

    this.updateDistributorsData();
  }

  @Get()
  override async getAll(
    @Res() response,
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
      return response.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data,
        totalRecords,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  async updateDistributorsData() {
    const distributors = await this.crudService.getAll();

    for (const distributor of distributors) {
      const [stats, flyerProbability] = await Promise.all([
        this.releaseService.getDistributorsStats(distributor._id),
        this.releaseService.getDistributorFlyerProbability(distributor._id),
      ]);

      await this.crudService.update(String(distributor._id), {
        _id: String(distributor._id),
        releasesCount: stats.releasesCount,
        pastReleasesCount: stats.totalPastReleases,
        pastReleasesWithFlyersCount: stats.totalPastWithFlyers,
        pastReleasesWithFlyersPercent: stats.totalPastReleases
          ? Math.floor((stats.totalPastWithFlyers / stats.totalPastReleases) * 100)
          : 0,
        flyerProbability,
        firstYear: stats.firstYear,
        lastYear: stats.lastYear,
      });
    }
  }
}
