import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Logger,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { CreateFlyerDto, FlyerDto, UpdateFlyerDto } from '@kinowki/shared';
import { UserData } from '../auth/jwt-strategy';
import { UserFlyerService } from '../user-flyer/user-flyer.service';
import { UserService } from '../user/user.service';
import { CrudController, getRegex, JwtAuthGuard, OptionalJwtAuthGuard } from '../utils';
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

  @UseGuards(JwtAuthGuard)
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFile(@UploadedFile() file: Express.Multer.File, @Req() req, @Res() res: Response) {
    const userData = req.user as UserData | null;
    if (!userData) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You must be logged in to perform this action.',
      });
    } else if (!file) {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
    } else {
      const user = await this.userService.get(userData.userId);
      if (user.importUsed) {
        res.status(HttpStatus.FORBIDDEN).json({
          message: 'Import can be done only once.',
        });
      } else {
        try {
          const userFlyers = await this.flyerService.importFromXlsx(file.buffer);
          await this.userFlyerService.importUserStatuses(
            userFlyers.map((userFlyer) => ({ ...userFlyer, user: userData.userId }))
          );

          await this.userService.update(userData.userId, { importUsed: true });

          res.status(HttpStatus.OK).json({
            message: `${userFlyers.length} user flyers imported!`,
            data: userFlyers.length,
          });
        } catch (err) {
          this.logger.error('An error occurred while trying to import flyers from file', err);
          res.status(err.status).json(err.response);
        }
      }
    }
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  override async getAll(
    @Req() req,
    @Res() res: Response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number,
    @Query('id') id?: string,
    @Query('flyerType') flyerType?: string,
    @Query('flyerSize') flyerSize?: string,
    @Query('flyerTags') flyerTags?: string
  ) {
    const userData = req.user as UserData | null;

    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const filters: FilterQuery<Flyer> = {
        ...(id ? { id: { $regex: getRegex(id) } } : {}),
        ...(flyerType ? { type: flyerType } : {}),
        ...(flyerSize ? { size: flyerSize } : {}),
        ...(flyerTags ? { tags: flyerTags } : {}),
      };

      const [data, totalRecords] = await Promise.all([
        this.flyerService.getAllWithReleases(params, filters),
        this.crudService.count(filters),
      ]);

      if (userData?.userId && data.length) {
        await this.userFlyerService.addUserStatus(userData.userId, data);
      }

      res.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data,
        totalRecords,
      });
    } catch (err) {
      res.status(err.status).json(err.response);
    }
  }
}
