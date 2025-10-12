import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as XLSX from 'xlsx';

import { CreateFlyerDto, CreateUserFlyerDto, FlyerDto, UpdateFlyerDto, UserFlyerStatus } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Flyer } from './flyer.schema';

@Injectable()
export class FlyerService extends CrudService<Flyer, FlyerDto, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';
  sortKey = '_id';

  constructor(@InjectModel(Flyer.name) model: Model<Flyer>) {
    super(model);
  }

  override async getAll(params?: { first: number; rows: number }, filters?: FilterQuery<Flyer>) {
    let query = this.model.find(filters);

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query
      .sort({ createdAt: -1 })
      .collation({ locale: 'pl', strength: 1 })
      .lean<FlyerDto[]>()
      .exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }

  async getAllWithReleases(params?: { first: number; rows: number }, filters?: FilterQuery<Flyer>) {
    let query = this.model
      .find(filters)
      .populate('tags')
      .populate({ path: 'releases', populate: [{ path: 'film' }, { path: 'distributors' }] });

    if (params) {
      query = query.limit(params.rows).skip(params.first);
    }

    const itemData = await query
      .sort({ createdAt: -1 })
      .collation({ locale: 'pl', strength: 1 })
      .lean<FlyerDto[]>()
      .exec();
    if (!itemData) {
      throw new NotFoundException(`${this.name} data not found!`);
    }
    return itemData;
  }

  async importFromXlsx(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellStyles: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils
      .sheet_to_json<
        [
          number | undefined,
          string | undefined,
          number | undefined,
          string | number | undefined,
          string | number | undefined,
          string | number | undefined
        ]
      >(sheet, { header: 1, raw: true })
      .filter((row) => !!row.length);

    const userFlyers: CreateUserFlyerDto[] = [];

    const allFlyers = await this.model.find({}, '_id id').lean();
    const flyerMap = new Map(allFlyers.map((flyer) => [flyer.id, flyer._id.toString()]));

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const [count, date, year, title, orgTitle, comment] = row;

      const flyerId = `${date ?? ''}${year ?? ''}${title ?? ''}${orgTitle ?? ''}`.trim();

      const cellAddress = `A${rowIndex + 1}`;
      const cell = sheet[cellAddress];
      const color = cell?.s?.fgColor?.rgb ? `#${cell.s.fgColor.rgb}`.toLowerCase() : null;

      const status = this.mapColorToStatus(color);
      if (status !== null) {
        const noteParts: (string | number)[] = [];
        if (count) {
          noteParts.push(count);
        }
        if (comment) {
          const trimmedComment = String(comment).trim();
          if (trimmedComment) {
            noteParts.push(trimmedComment);
          }
        }
        const note = noteParts.join('\n');

        const flyer_id = flyerMap.get(flyerId);
        if (flyer_id) {
          userFlyers.push({ flyer: flyer_id, status, note });
        } else {
          console.error('Flyer missing!', flyerId);
        }
      }
    }

    return userFlyers;
  }

  private mapColorToStatus(color?: string): UserFlyerStatus | null {
    if (!color) return null;
    const normalized = color.toLowerCase();
    switch (normalized) {
      case '#d70909':
        return UserFlyerStatus.WANT;
      case '#2ba32b':
        return UserFlyerStatus.TRADE;
      case '#c8d221':
        return UserFlyerStatus.HAVE;
      case '#464646':
        return UserFlyerStatus.UNWANTED;
      default:
        return null;
    }
  }
}
