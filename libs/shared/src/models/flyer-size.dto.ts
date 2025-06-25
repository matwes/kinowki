export interface CreateFlyerSizeDto {
  width: number;
  height: number;
  name?: string;
}

export interface UpdateFlyerSizeDto extends Partial<CreateFlyerSizeDto> {
  _id: string;
}

export interface FlyerSizeDto extends CreateFlyerSizeDto {
  _id: string;
}
