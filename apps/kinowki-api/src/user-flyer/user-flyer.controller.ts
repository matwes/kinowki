import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import 'multer';

import { CreateUserFlyerDto, FlyerDto, UpdateUserFlyerDto, UserFlyerDto, UserFlyerFilter } from '@kinowki/shared';
import { CrudController, errorHandler, JwtAuthGuard, OptionalJwtAuthGuard } from '../utils';
import { UserFlyer } from './user-flyer.schema';
import { UserFlyerService } from './user-flyer.service';
import { UserData } from '../auth/jwt-strategy';
import { UserService } from '../user/user.service';

@Controller('user-flyer')
export class UserFlyerController extends CrudController<
  UserFlyer,
  UserFlyerDto,
  CreateUserFlyerDto,
  UpdateUserFlyerDto
> {
  name = 'user flyer';

  constructor(protected userFlyerService: UserFlyerService, private readonly userService: UserService) {
    super(userFlyerService);
    this.updateUsers();
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  override async getAll(
    @Req() req,
    @Res() res: Response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('user') userId?: string,
    @Query('state') state?: UserFlyerFilter
  ) {
    const userData = req.user as UserData | null;

    if (!state || !userId) {
      console.error('Getting user flyers', 'No state (', state, ') or user id (', userId, ') in request');
      res.status(404).json({ message: 'Brak statusu lub od użytkownika!' });
    } else {
      try {
        const params = rows ? { first: first || 0, rows } : undefined;

        const result = await this.userFlyerService.getAllWithReleases(state, userId, userData.userId, params);

        const flyers = result.data.map((userFlyer) => userFlyer.flyer as unknown as FlyerDto);

        if (userData?.userId && result.data.length) {
          await this.userFlyerService.addUserStatus(userData.userId, flyers);
        }

        res.status(HttpStatus.OK).json({
          message: `All ${this.name} data found successfully`,
          data: flyers,
          totalRecords: result.totalRecords,
        });
      } catch (err) {
        errorHandler(res, err, 'Getting user flyers');
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  override async create(@Req() req, @Res() res: Response, @Body() createDto: CreateUserFlyerDto) {
    const userData = req.user as UserData | null;
    const userId = userData.userId;

    if (!userData) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You must be logged in to perform this action.',
      });
    } else {
      try {
        const newItem = await this.crudService.create({ ...createDto, user: userId });

        this.userFlyerService
          .getUserFlyerStats(userId)
          .then((stats) =>
            this.userService
              .update(userId, stats)
              .catch((err) => console.error('Update user stats after adding flyer failed:', err))
          )
          .catch((err) => console.error('Getting user stats after adding flyer failed:', err));

        this.userFlyerService
          .updateUserOffers(userId)
          .catch((err) => console.error('Updating user offers after adding flyer failed:', err));

        res.status(HttpStatus.CREATED).json({
          message: `${this.name} has been created successfully`,
          data: newItem,
        });
      } catch (err) {
        errorHandler(res, err, 'Adding user flyer');
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  override async update(
    @Req() req,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: UpdateUserFlyerDto
  ) {
    const userData = req.user as UserData | null;
    const userId = userData.userId;

    if (!userData) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You must be logged in to perform this action.',
      });
    } else {
      try {
        const existingItem = await this.crudService.update(id, updateDto);

        this.userFlyerService
          .getUserFlyerStats(userId)
          .then((stats) =>
            this.userService
              .update(userId, stats)
              .catch((err) => console.error('Update user stats after updating flyer failed:', err))
          )
          .catch((err) => console.error('Getting user stats after updating flyer failed:', err));

        this.userFlyerService
          .updateUserOffers(userId)
          .catch((err) => console.error('Updating user offers after updating flyer failed:', err));

        res.status(HttpStatus.OK).json({
          message: `${this.name} has been successfully updated`,
          data: existingItem,
        });
      } catch (err) {
        errorHandler(res, err, 'Updating user flyer');
      }
    }
  }

  async updateUsers() {
    const users = await this.userService.getAll();
    await Promise.all(
      users.map(async (user) => {
        const userFlyerStats = await this.userFlyerService.getUserFlyerStats(user._id);
        await this.userService.update(user._id, userFlyerStats);

        console.log(
          'Updated user',
          user.name,
          'with values: have',
          userFlyerStats.haveTotal,
          ', trade:',
          userFlyerStats.tradeTotal,
          'and want:',
          userFlyerStats.wantTotal
        );
      })
    );
  }
}
