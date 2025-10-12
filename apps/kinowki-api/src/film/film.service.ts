import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateFilmDto, FilmDto, UpdateFilmDto } from '@kinowki/shared';
import { CrudService } from '../utils';
import { Film } from './film.schema';

@Injectable()
export class FilmService extends CrudService<Film, FilmDto, CreateFilmDto, UpdateFilmDto> {
  name = 'film';
  sortKey = 'title';

  constructor(@InjectModel(Film.name) model: Model<Film>) {
    super(model);
    this.updateAllFilms();
  }

  async updateAllFilms() {
    const films = await this.model.find({}, { _id: 1, title: 1 });
    console.log(`Found ${films.length} films. Updating...`);

    let updated = 0;

    for (const film of films) {
      const firstLetter = this.computeFirstLetter(film.title);
      await this.model.updateOne({ _id: film._id }, { $set: { firstLetter } });
      updated++;
      if (updated % 500 === 0) {
        console.log(`Updated ${updated}/${films.length}`);
      }
    }

    console.log(`✅ Done. ${updated} films updated.`);
  }

  private computeFirstLetter(title: string): string {
    if (!title) return '#';

    const firstChar = title.trim().charAt(0).toUpperCase();

    if (letters.includes(firstChar)) {
      return firstChar;
    }

    const normalized = firstChar
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace('Ł', 'Ł')
      .replace('Ś', 'Ś')
      .replace('Ź', 'Ź')
      .replace('Ż', 'Ż')
      .replace('Ó', 'Ó');

    if (letters.includes(normalized)) {
      return normalized;
    }

    return '#';
  }
}

const letters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'Ł',
  'M',
  'N',
  'O',
  'Ó',
  'P',
  'Q',
  'R',
  'S',
  'Ś',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'Ź',
  'Ż',
];
