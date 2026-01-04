import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { errorHandler, JwtAuthGuard } from '../utils';
import { UserService } from '../user/user.service';
import { UserOfferService } from './user-offer.service';
import { UserData } from '../auth/jwt-strategy';

@Controller('user-offer')
export class UserOfferController {
  name = 'user offer';

  constructor(private readonly userOfferService: UserOfferService, private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async get(@Req() req, @Res() res: Response) {
    const userData = req.user as UserData | null;
    const userId = userData.userId;

    if (!userData) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You must be logged in to perform this action.',
      });
    } else {
      try {
        const userOffers = await this.userOfferService.getAll(undefined, {
          $or: [{ userTrade: userId }, { userWant: userId }],
        });

        const offers = userOffers.reduce<{ trade: Record<string, number>; want: Record<string, number> }>(
          (map, userOffer) => {
            if (userOffer.userTrade.toString() === userId) {
              map.trade[userOffer.userWant.toString()] = userOffer.count;
            } else {
              map.want[userOffer.userTrade.toString()] = userOffer.count;
            }
            return map;
          },
          { trade: {}, want: {} }
        );

        res.status(HttpStatus.OK).json({
          message: `${this.name} found successfully`,
          data: {
            activeUser: userId,
            offers,
          },
        });
      } catch (err) {
        errorHandler(res, err, `Getting all ${this.name}`);
      }
    }
  }
}
