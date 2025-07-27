import { ImageDto } from './image.dto';
import { ReleaseDto } from './release.dto';
import { TagDto } from './tag.dto';

export interface CreateFlyerDto {
  id: string;
  type?: number;
  size?: number;
  tags: string[];
  note?: string;
  releases: string[];
  images: ImageDto[];
}

export interface UpdateFlyerDto extends Partial<CreateFlyerDto> {
  _id: string;
}

export interface FlyerDto extends Omit<CreateFlyerDto, 'releases' | 'tags'> {
  _id: string;
  createdAt: string;
  releases: ReleaseDto[];
  tags: TagDto[];
}
