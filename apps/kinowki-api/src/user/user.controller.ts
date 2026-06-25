import { Body, Controller, Get, HttpStatus, ParseIntPipe, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { CreateUserDto, UpdateUserDto, UserDto } from '@kinowki/shared';
import { UserData } from '../auth/jwt-strategy';
import { CrudController, errorHandler, JwtAuthGuard } from '../utils';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends CrudController<User, UserDto, CreateUserDto, UpdateUserDto> {
  name = 'user';

  constructor(userService: UserService) {
    super(userService);
  }

  @Get()
  async getAll(
    @Req() req,
    @Res() res: Response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number
  ) {
    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const [data, totalRecords] = await Promise.all([
        this.crudService.getAll(params, { isActive: true }),
        this.crudService.count(),
      ]);
      res.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data,
        totalRecords,
      });
    } catch (err) {
      errorHandler(res, err, 'Getting users');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req, @Res() res: Response) {
    const userData = req.user as UserData | null;

    if (!userData) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You must be logged in to perform this action.',
      });
    }

    try {
      const user = await this.crudService.get(userData.userId);

      const settings = {
        email: user.email,
        name: user.name,
        city: user.city,
      };

      return res.status(HttpStatus.OK).json({
        message: 'User settings loaded successfully',
        data: settings,
      });
    } catch (err) {
      errorHandler(res, err, 'Getting current user settings');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/me')
  async updateCurrentUser(@Req() req, @Res() res: Response, @Body() updateDto: UpdateUserDto) {
    const userData = req.user as UserData | null;

    if (!userData) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'You must be logged in to perform this action.' });
      return;
    }

    try {
      await this.crudService.update(userData.userId, {
        ...(updateDto.name !== undefined && { name: updateDto.name }),
        ...(updateDto.city !== undefined && { city: updateDto.city }),
      });

      res.status(HttpStatus.OK).json({ message: `${this.name} has been successfully updated` });
    } catch (err) {
      errorHandler(res, err, 'Updating flyer');
    }
  }
}
