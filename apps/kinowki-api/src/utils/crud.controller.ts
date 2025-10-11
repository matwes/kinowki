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
import { CrudService } from './crud.service';
import { AdminGuard } from './admin.guard';

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
      res.status(err.status).json(err.response);
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
      res.status(err.status).json(err.response);
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
      res.status(err.status).json(err.response);
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
      res.status(err.status).json(err.response);
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
      res.status(err.status).json(err.response);
    }
  }
}
