import { Body, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { CrudService } from './crud.service';
import { AdminGuard } from './admin.guard';

export abstract class CrudController<Schema, CreateDto, UpdateDto> {
  abstract name: string;

  constructor(protected readonly crudService: CrudService<Schema, CreateDto, UpdateDto>) {}

  @UseGuards(AdminGuard)
  @Post()
  async create(@Res() response, @Body() createDto: CreateDto) {
    try {
      const newItem = await this.crudService.create(createDto);
      return response.status(HttpStatus.CREATED).json({
        message: `${this.name} has been created successfully`,
        data: newItem,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  @UseGuards(AdminGuard)
  @Put('/:id')
  async update(@Res() response, @Param('id') id: string, @Body() updateDto: UpdateDto) {
    try {
      const existingItem = await this.crudService.update(id, updateDto);
      return response.status(HttpStatus.OK).json({
        message: `${this.name} has been successfully updated`,
        data: existingItem,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  @Get()
  async getAll(
    @Res() response,
    @Query('first', new ParseIntPipe({ optional: true })) first?: number,
    @Query('rows', new ParseIntPipe({ optional: true })) rows?: number
  ) {
    try {
      const params = rows ? { first: first || 0, rows } : undefined;
      const [data, totalRecords] = await Promise.all([this.crudService.getAll(params), this.crudService.count()]);
      return response.status(HttpStatus.OK).json({
        message: `All ${this.name} data found successfully`,
        data,
        totalRecords,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  @Get('/:id')
  async get(@Res() response, @Param('id') id: string) {
    try {
      const existingItem = await this.crudService.get(id);
      return response.status(HttpStatus.OK).json({
        message: `${this.name} found successfully`,
        data: existingItem,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  @UseGuards(AdminGuard)
  @Delete('/:id')
  async delete(@Res() response, @Param('id') id: string) {
    try {
      const deletedItem = await this.crudService.delete(id);
      return response.status(HttpStatus.OK).json({
        message: `${this.name} deleted successfully`,
        data: deletedItem,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }
}
