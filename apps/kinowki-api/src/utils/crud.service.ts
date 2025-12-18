import { NotFoundException } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';

export abstract class CrudService<Schema, BaseDto, CreateDto, UpdateDto> {
  abstract name: string;
  abstract sortKey: string;
  sortOrder: 1 | -1 = 1;

  constructor(protected model: Model<Schema>) {}

  async create(createDto: CreateDto) {
    const newItem = new this.model(createDto);
    return (await newItem.save()).toObject<BaseDto>();
  }

  async update(id: string, updateDto: UpdateDto) {
    const existingItem = await this.model.findByIdAndUpdate(id, updateDto, { new: true }).lean<BaseDto>().exec();
    if (!existingItem) {
      throw new NotFoundException(`${this.name} #${id} not found`);
    }
    return existingItem;
  }

  async getAll(params?: { first: number; rows: number }, filters?: FilterQuery<Schema>) {
    let query = this.model.find(filters);

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query
      .sort({ [this.sortKey]: this.sortOrder })
      .collation({ locale: 'pl', strength: 1 })
      .lean<BaseDto[]>()
      .exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }

  async get(id: string) {
    const existingItem = await this.model.findById(id).lean<BaseDto>().exec();
    if (!existingItem) {
      throw new NotFoundException(`${this.name} #${id} not found`);
    }
    return existingItem;
  }

  async delete(id: string) {
    const deletedItem = await this.model.findByIdAndDelete(id).lean<BaseDto>().exec();
    if (!deletedItem) {
      throw new NotFoundException(`${this.name} #${id} not found`);
    }
    return deletedItem;
  }

  async deleteMany(filter: FilterQuery<Schema>) {
    return await this.model.deleteMany(filter).exec();
  }

  async count(filters?: FilterQuery<Schema>): Promise<number> {
    return await this.model.countDocuments(filters);
  }
}
