import { Body, Controller, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import 'multer';

import { CreateUserFlyerDto, UpdateUserFlyerDto, UserFlyerDto } from '@kinowki/shared';
import { CrudController, JwtAuthGuard } from '../utils';
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
        const userFlyerStats = await this.userFlyerService.getUserFlyerStats(userId);
        await this.userService.update(userId, userFlyerStats);

        res.status(HttpStatus.CREATED).json({
          message: `${this.name} has been created successfully`,
          data: newItem,
        });
      } catch (err) {
        res.status(err.status).json(err.response);
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
        const userFlyerStats = await this.userFlyerService.getUserFlyerStats(userId);
        await this.userService.update(userId, userFlyerStats);

        res.status(HttpStatus.OK).json({
          message: `${this.name} has been successfully updated`,
          data: existingItem,
        });
      } catch (err) {
        res.status(err.status).json(err.response);
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
