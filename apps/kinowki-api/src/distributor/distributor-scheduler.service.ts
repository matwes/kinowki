import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Types } from 'mongoose';

import { DistributorService } from './distributor.service';
import { ReleaseService } from '../release/release.service';

@Injectable()
export class DistributorSchedulerService {
  private readonly logger = new Logger(DistributorSchedulerService.name);

  constructor(
    private readonly distributorService: DistributorService,
    private readonly releaseService: ReleaseService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateDistributorsData() {
    this.logger.log('Starting distributor data update...');

    const distributors = await this.distributorService.getAll();

    for (const distributor of distributors) {
      try {
        const distributorId = new Types.ObjectId(distributor._id);

        const [stats, flyerProbability] = await Promise.all([
          this.releaseService.getDistributorsStats(distributorId),
          this.releaseService.getDistributorFlyerProbability(distributorId),
        ]);

        await this.distributorService.update(String(distributor._id), {
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
      } catch (error) {
        this.logger.error(`❌ Failed updating distributor ${distributor.name}`, error.stack);
      }
    }

    this.logger.log('Distributor data update finished.');
  }
}
