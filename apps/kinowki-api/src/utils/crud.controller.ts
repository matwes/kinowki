import {
  Body,
  Delete,
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
import { AdminGuard } from './admin.guard';
import { CrudService } from './crud.service';
import { errorHandler } from './error-handler';

export abstract class CrudController<Schema, BaseDto, CreateDto, UpdateDto> {
  abstract name: string;

  constructor(protected readonly crudService: CrudService<Schema, BaseDto, CreateDto, UpdateDto>) {}

  @UseGuards(AdminGuard)
  @Post()
  async create(@Req() req, @Res() res: Response, @Body() createDto: CreateDto) {
    try {
      const newItem = await this.crudService.create(createDto);
      res.status(HttpStatus.CREATED).json({
        message: `${this.name} has been created successfully`,
        data: newItem,
      });
    } catch (err) {
      errorHandler(res, err, `Creating ${this.name}`);
    }
  }

  @UseGuards(AdminGuard)
  @Put('/:id')
  async update(@Req() req, @Res() res: Response, @Param('id') id: string, @Body() updateDto: UpdateDto) {
    try {
      const existingItem = await this.crudService.update(id, updateDto);
      res.status(HttpStatus.OK).json({
        message: `${this.name} has been successfully updated`,
        data: existingItem,
      });
    } catch (err) {
      errorHandler(res, err, `Updating ${this.name}`);
    }
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
      const [data, totalRecords] = await Promise.all([this.crudService.getAll(params), this.crudService.count()]);
      res.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data,
        totalRecords,
      });
    } catch (err) {
      errorHandler(res, err, `Getting ${this.name}`);
    }
  }

  @Get('/:id')
  async get(@Res() res: Response, @Param('id') id: string) {
    try {
      const existingItem = await this.crudService.get(id);
      res.status(HttpStatus.OK).json({
        message: `${this.name} found successfully`,
        data: existingItem,
      });
    } catch (err) {
      errorHandler(res, err, `Getting single ${this.name}`);
    }
  }

  @UseGuards(AdminGuard)
  @Delete('/:id')
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedItem = await this.crudService.delete(id);
      res.status(HttpStatus.OK).json({
        message: `${this.name} deleted successfully`,
        data: deletedItem,
      });
    } catch (err) {
      errorHandler(res, err, `Deleting ${this.name}`);
    }
  }
}
