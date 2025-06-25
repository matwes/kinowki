export interface CreateFlyerDto {
  type: string;
  size: string;
  tags: string[];
  note?: string;
  releases: string[];
}

export interface UpdateFlyerDto extends Partial<CreateFlyerDto> {
  _id: string;
}

export interface FlyerDto extends CreateFlyerDto {
  _id: string;
}
