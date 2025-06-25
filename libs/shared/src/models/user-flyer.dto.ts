export interface CreateUserFlyerDto {
  flyer: string;
  collection: boolean;
  exchange: boolean;
  wanted: boolean;
  notInterested: boolean;
  count: number;
}

export interface UpdateUserFlyerDto extends Partial<CreateUserFlyerDto> {
  _id: string;
}

export interface UserFlyerDto extends CreateUserFlyerDto {
  _id: string;
}
