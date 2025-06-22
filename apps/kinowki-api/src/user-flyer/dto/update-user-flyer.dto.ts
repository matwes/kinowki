import { PartialType } from '@nestjs/mapped-types';
import { CreateUserFlyerDto } from './create-user-flyer.dto';

export class UpdateUserFlyerDto extends PartialType(CreateUserFlyerDto) {}
