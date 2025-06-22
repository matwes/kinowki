import { PartialType } from '@nestjs/mapped-types';
import { CreateFlyerSizeDto } from './create-flyer-size.dto';

export class UpdateFlyerSizeDto extends PartialType(CreateFlyerSizeDto) {}
