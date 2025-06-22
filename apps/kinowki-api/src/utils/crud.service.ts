import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

export abstract class CrudService<Schema, CreateDto, UpdateDto> {
  abstract name: string;
  abstract sortKey: string;

  constructor(protected model: Model<Schema>) {}

  async create(createDto: CreateDto) {
    const newItem = new this.model(createDto);
    return newItem.save();
  }

  async update(id: string, updateDto: UpdateDto) {
    const existingItem = await this.model.findByIdAndUpdate(id, updateDto, { new: true }).lean().exec();
    if (!existingItem) {
      throw new NotFoundException(`${this.name} #${id} not found`);
    }
    return existingItem;
  }

  async getAll(params?: { first: number; rows: number }) {
    let query = this.model.find();

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query.sort(this.sortKey).lean().exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }

  async get(id: string) {
    const existingItem = await this.model.findById(id).lean().exec();
    if (!existingItem) {
      throw new NotFoundException(`${this.name} #${id} not found`);
    }
    return existingItem;
  }

  async delete(id: string) {
    const deletedItem = await this.model.findByIdAndDelete(id).lean().exec();
    if (!deletedItem) {
      throw new NotFoundException(`${this.name} #${id} not found`);
    }
    return deletedItem;
  }

  async count(): Promise<number> {
    return await this.model.countDocuments();
  }
}
