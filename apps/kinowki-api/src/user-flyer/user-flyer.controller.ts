import { Body, Controller, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import 'multer';

import { CreateUserFlyerDto, UpdateUserFlyerDto, UserFlyerDto } from '@kinowki/shared';
import { CrudController, JwtAuthGuard } from '../utils';
import { UserFlyer } from './user-flyer.schema';
import { UserFlyerService } from './user-flyer.service';
import { UserData } from '../auth/jwt-strategy';

@Controller('user-flyer')
export class UserFlyerController extends CrudController<
  UserFlyer,
  UserFlyerDto,
  CreateUserFlyerDto,
  UpdateUserFlyerDto
> {
  name = 'user flyer';

  constructor(protected userFlyerService: UserFlyerService) {
    super(userFlyerService);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  override async create(@Req() req, @Res() res: Response, @Body() createDto: CreateUserFlyerDto) {
    const userData = req.user as UserData | null;

    if (!userData) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You must be logged in to perform this action.',
      });
    } else {
      try {
        const newItem = await this.crudService.create({ ...createDto, user: userData.userId });
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

    if (!userData) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You must be logged in to perform this action.',
      });
    } else {
      try {
        const existingItem = await this.crudService.update(id, updateDto);
        res.status(HttpStatus.OK).json({
          message: `${this.name} has been successfully updated`,
          data: existingItem,
        });
      } catch (err) {
        res.status(err.status).json(err.response);
      }
    }
  }
}
