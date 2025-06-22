import { PartialType } from '@nestjs/mapped-types';
import { CreateFlyerTypeDto } from './create-flyer-type.dto';

export class UpdateFlyerTypeDto extends PartialType(CreateFlyerTypeDto) {}
