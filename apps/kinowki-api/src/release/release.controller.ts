import { Controller } from '@nestjs/common';

import { CrudController } from '../utils';
import { Release } from './schemas/release.schema';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { ReleaseService } from './release.service';

@Controller('release')
export class ReleaseController extends CrudController<Release, CreateReleaseDto, UpdateReleaseDto> {
  name = 'release';

  constructor(releaseService: ReleaseService) {
    super(releaseService);
  }
}
