import { Controller, Get, HttpStatus, ParseIntPipe, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';

import { CreateUserDto, UpdateUserDto, UserDto } from '@kinowki/shared';
import { CrudController, errorHandler } from '../utils';
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
      errorHandler(res, err, "Getting users");
    }
  }
}
