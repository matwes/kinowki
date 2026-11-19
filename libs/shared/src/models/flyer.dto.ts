import { ImageDto } from './image.dto';
import { ReleaseDto } from './release.dto';
import { TagDto } from './tag.dto';
import { UserFlyerDto } from './user-flyer.dto';

export enum FlyerOrientation {
  PORTRAIT = 0,
  LANDSCAPE = 1,
  SQUARE = 2,
}

export interface CreateFlyerDto {
  sortName: string;
  sortDate: string;
  filterName: string;
  kind: number;
  kindNote?: string;
  type?: number;
  size?: number;
  orientation?: FlyerOrientation;
  tags: string[];
  note?: string;
  releases: string[];
  images: ImageDto[];
  highlight: boolean;
}

export interface UpdateFlyerDto extends Partial<CreateFlyerDto> {
  _id: string;
}

export interface FlyerDto extends Omit<CreateFlyerDto, 'releases' | 'tags'> {
  _id: string;
  createdAt: string;
  releases: ReleaseDto[];
  tags: TagDto[];
  userFlyer?: UserFlyerDto;
  have?: string[];
  trade?: string[];
  want?: string[];
}
