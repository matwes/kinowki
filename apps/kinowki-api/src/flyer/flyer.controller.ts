import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { CreateFlyerDto, FlyerDto, UpdateFlyerDto } from '@kinowki/shared';
import { UserData } from '../auth/jwt-strategy';
import { UserFlyerService } from '../user-flyer/user-flyer.service';
import { UserService } from '../user/user.service';
import { AdminGuard, CrudController, errorHandler, getRegex, OptionalJwtAuthGuard } from '../utils';
import { Flyer } from './flyer.schema';
import { FlyerService } from './flyer.service';

@Controller('flyer')
export class FlyerController extends CrudController<Flyer, FlyerDto, CreateFlyerDto, UpdateFlyerDto> {
  private readonly logger = new Logger(FlyerController.name);

  name = 'flyer';

  constructor(
    protected flyerService: FlyerService,
    private readonly userFlyerService: UserFlyerService,
    private readonly userService: UserService
  ) {
    super(flyerService);
  }

  @UseGuards(AdminGuard)
  @Put('/:id')
  async update(@Req() req, @Res() res: Response, @Param('id') id: string, @Body() updateDto: UpdateFlyerDto) {
    try {
      const existingItem = await this.crudService.update(id, updateDto);
      const flyerName = `${existingItem.sortDate} ${existingItem.sortName}`;

      await this.userFlyerService.updateFlyerName(existingItem._id, flyerName);

      res.status(HttpStatus.OK).json({
        message: `${this.name} has been successfully updated`,
        data: existingItem,
      });
    } catch (err) {
      errorHandler(res, err, 'Updating flyer');
    }
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  override async getAll(
    @Req() req,
    @Res() res: Response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('sort', new ParseIntPipe({ optional: true })) flyerSort?: 1 | 2 | 3,
    @Query('filterName') filterName?: string,
    @Query('flyerType') flyerType?: string,
    @Query('flyerSize') flyerSize?: string,
    @Query('flyerTags') flyerTags?: string
  ) {
    const userData = req.user as UserData | null;

    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const filters: FilterQuery<Flyer> = {
        ...(filterName ? { filterName: { $regex: getRegex(filterName) } } : {}),
        ...(flyerType ? { type: flyerType } : {}),
        ...(flyerSize ? { size: flyerSize } : {}),
        ...(flyerTags ? { tags: flyerTags } : {}),
      };
      const sort: Record<string, 1 | -1> | undefined =
        flyerSort === 1
          ? { createdAt: -1 }
          : flyerSort === 2
          ? { sortDate: -1, sortName: 1 }
          : flyerSort === 3
          ? { sortName: 1, sortDate: -1 }
          : undefined;

      const [data, totalRecords] = await Promise.all([
        this.flyerService.getAllWithReleases(params, filters, sort),
        this.crudService.count(filters),
      ]);

      if (data.length) {
        await this.userFlyerService.addUserStatus(userData?.userId?.toString(), data);
      }

      res.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data,
        totalRecords,
      });
    } catch (err) {
      errorHandler(res, err, 'Getting flyers');
    }
  }

  @UseGuards(AdminGuard)
  @Delete('/:id')
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedItem = await this.flyerService.delete(id);
      const deleteUserFlyers = await this.userFlyerService.deleteMany({ flyer: id });

      console.log(`Flyer ${id} and ${deleteUserFlyers.deletedCount} user statuses deleted`);

      res.status(HttpStatus.OK).json({
        message: `${this.name} deleted successfully`,
        data: deletedItem,
      });
    } catch (err) {
      errorHandler(res, err, `Deleting ${this.name}`);
    }
  }
}
