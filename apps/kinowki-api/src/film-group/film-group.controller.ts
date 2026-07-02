import { Controller, Get, HttpStatus, Param, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { CreateFilmGroupDto, FilmGroupDto, UpdateFilmGroupDto } from '@kinowki/shared';
import { CrudController, errorHandler, OptionalJwtAuthGuard, sortFlyers } from '../utils';
import { FilmGroup } from './film-group.schema';
import { FilmGroupService } from './film-group.service';
import { UserData } from '../auth/jwt-strategy';
import { FilmService } from '../film/film.service';
import { ReleaseService } from '../release/release.service';
import { FlyerService } from '../flyer/flyer.service';
import { UserFlyerService } from '../user-flyer/user-flyer.service';

@Controller('film-group')
export class FilmGroupController extends CrudController<
  FilmGroup,
  FilmGroupDto,
  CreateFilmGroupDto,
  UpdateFilmGroupDto
> {
  name = 'film group';

  constructor(
    filmGroupService: FilmGroupService,
    private readonly filmService: FilmService,
    private readonly flyerService: FlyerService,
    private readonly releaseService: ReleaseService,
    private readonly userFlyerService: UserFlyerService
  ) {
    super(filmGroupService);
  }

  @Get('film/:filmId')
  @UseGuards(OptionalJwtAuthGuard)
  async getFilmGroup(@Param('filmId') filmId: string, @Req() req, @Res() res: Response) {
    const userData = req.user as UserData | null;

    try {
      const film = await this.filmService.get(filmId);

      if (!film) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Film not found' });
      }

      const group = film.group;

      const films = group ? await this.filmService.getAll(undefined, { group }) : [film];

      const extendedFilms = await Promise.all(
        films.map(async (film) => {
          const releases = await this.releaseService.getAll(undefined, { film: film._id });

          let flyerCount = 0;

          const releasesWithFlyers = await Promise.all(
            releases.map(async (release) => {
              const flyers = (await this.flyerService.getAll(undefined, { releases: release._id })).sort(sortFlyers);

              flyerCount += flyers.length;

              if (userData?.userId && flyers.length) {
                await this.userFlyerService.addUserStatus(userData.userId, flyers);
              }

              return { ...release, flyers };
            })
          );

          return {
            ...film,
            releases: releasesWithFlyers.sort((a, b) => a.date.localeCompare(b.date)),
            flyerCount,
          };
        })
      );

      return res.status(HttpStatus.OK).json({
        message: 'Film group loaded successfully',
        data: {
          group: {
            id: group ?? film._id,
            name: group ? 'collection' : film.title,
            virtual: !group,
          },
          films: extendedFilms.sort((a, b) => {
            if (a.year !== b.year) {
              return a.year - b.year;
            }

            const firstReleaseA = a.releases[0]?.date ?? '';
            const firstReleaseB = b.releases[0]?.date ?? '';

            return firstReleaseA.localeCompare(firstReleaseB);
          }),
        },
      });
    } catch (err) {
      return errorHandler(res, err, 'Getting film group');
    }
  }
}
