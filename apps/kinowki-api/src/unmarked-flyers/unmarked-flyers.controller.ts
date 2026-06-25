import { Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { UserFlyerStatus } from '@kinowki/shared';
import { FlyerService } from '../flyer/flyer.service';
import { UserService } from '../user/user.service';
import { UserFlyerService } from '../user-flyer/user-flyer.service';
import { UserData } from '../auth/jwt-strategy';
import { errorHandler, JwtAuthGuard } from '../utils';

@Controller('unmarked-flyers')
export class UnmarkedFlyersController {
  constructor(
    private readonly userService: UserService,
    private readonly flyerService: FlyerService,
    private readonly userFlyerService: UserFlyerService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCurrentUser(@Req() req, @Res() res: Response) {
    const userData = req.user as UserData | null;

    if (!userData) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You must be logged in to perform this action.',
      });
    }

    try {
      const totalFlyers = await this.flyerService.count();
      const markedFlyers = await this.userFlyerService.count({ user: userData.userId });

      return res.status(HttpStatus.OK).json({
        message: 'User settings loaded successfully',
        data: totalFlyers - markedFlyers,
      });
    } catch (err) {
      errorHandler(res, err, 'Getting current user unmarked flyers total');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async markAsWanted(@Req() req, @Res() res: Response) {
    const userData = req.user as UserData;

    if (!userData) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
    }

    try {
      const userId = userData.userId;

      const [existing, allFlyers] = await Promise.all([
        this.userFlyerService.getAll(undefined, { user: userId }),
        this.flyerService.getAll(),
      ]);
      const existingIds = new Set(existing.map((userFlyer) => userFlyer.flyer.toString()));

      const toInsert = allFlyers
        .filter((flyer) => !existingIds.has(flyer._id.toString()))
        .map((flyer) => ({
          user: userId,
          flyer: flyer._id,
          flyerName: `${flyer.sortDate} ${flyer.sortName}`,
          status: UserFlyerStatus.WANT,
        }));

      if (toInsert.length > 0) {
        await this.userFlyerService.insertMany(toInsert);
      }

      this.userFlyerService
        .getUserFlyerStats(userId)
        .then((stats) =>
          this.userService
            .update(userId, stats)
            .catch((err) => console.error('Update user stats after marking all unmarked flyers as wanted failed:', err))
        )
        .catch((err) => console.error('Getting user stats after marking all unmarked flyers as wanted failed:', err));

      this.userFlyerService
        .updateUserOffers(userId)
        .catch((err) => console.error('Updating user offers after marking all unmarked flyers as wanted failed:', err));

      return res.status(HttpStatus.OK).json({
        message: 'All unmarked flyers marked as WANT',
        data: toInsert.length,
      });
    } catch (err) {
      errorHandler(res, err, 'Marking all unmarked flyers as WANT');
    }
  }
}
