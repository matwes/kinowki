import { Controller } from '@nestjs/common';

import { CreateReleaseDto, UpdateReleaseDto } from '@kinowki/shared';
import { CrudController } from '../utils';
import { Release } from './release.schema';
import { ReleaseService } from './release.service';

@Controller('release')
export class ReleaseController extends CrudController<Release, CreateReleaseDto, UpdateReleaseDto> {
  name = 'release';

  constructor(releaseService: ReleaseService) {
    super(releaseService);
  }
}
