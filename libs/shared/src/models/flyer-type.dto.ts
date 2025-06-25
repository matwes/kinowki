export interface CreateFlyerTypeDto {
  name: string;
}

export interface UpdateFlyerTypeDto extends Partial<CreateFlyerTypeDto> {
  _id: string;
}

export interface FlyerTypeDto extends CreateFlyerTypeDto {
  _id: string;
}
