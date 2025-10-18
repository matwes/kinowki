import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as XLSX from 'xlsx';

import {
  CreateFlyerDto,
  CreateUserFlyerDto,
  FlyerDto,
  ReleaseDto,
  UpdateFlyerDto,
  UserFlyerStatus,
  flyerSizeMap,
  flyerTypeMap,
  releaseTypeMap,
} from '@kinowki/shared';
import { CrudService } from '../utils';
import { Flyer } from './flyer.schema';

@Injectable()
export class FlyerService extends CrudService<Flyer, FlyerDto, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';
  sortKey = '_id';

  constructor(@InjectModel(Flyer.name) model: Model<Flyer>) {
    super(model);

    this.migrate();
  }

  async migrate() {
    const flyers = await this.model
      .find()
      .populate({
        path: 'releases',
        populate: {
          path: 'film',
        },
      })
      .lean();

    console.log(`Found ${flyers.length} flyers to process...`);

    for (const flyer of flyers) {
      if (!flyer.releases?.length) {
        console.warn(`⚠️ Flyer ${flyer.id} has no releases, skipping`);
        continue;
      }

      const releases = flyer.releases as unknown as ReleaseDto[];

      const oldestRelease = releases.reduce((oldest, current) => (current.date < oldest.date ? current : oldest));

      let name = `${oldestRelease.date} ${releases.map((release) => release.film.title).join(' | ')}`;

      const tags = [
        ...(oldestRelease.releaseType !== 1 && oldestRelease.releaseType !== 5
          ? [releaseTypeMap[oldestRelease.releaseType]]
          : []),
        ...(oldestRelease.note ? [oldestRelease.note] : []),
        ...(!flyer.size || flyer.size === 1 ? [] : [flyerSizeMap[flyer.size]]),
        ...(!flyer.type || flyer.type === 1 ? [] : [flyerTypeMap[flyer.type]]),
        ...(flyer.note ? [flyer.note] : []),
      ];

      if (tags.length) {
        name += ` [${tags.join('] [')}]`;
      }

      await this.model.updateOne({ _id: flyer._id }, { $set: { name } });

      console.log(`✅ Updated ${flyer.id} → ${name}`);
    }
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
