export enum UserFlyerStatus {
  HAVE = 0,
  TRADE = 1,
  WANT = 2,
  UNWANTED = 3,
}

export interface CreateUserFlyerDto {
  user?: string;
  flyer: string;
  status: UserFlyerStatus;
  note?: string;
}

export interface UpdateUserFlyerDto extends Partial<CreateUserFlyerDto> {
  _id?: string;
}

export interface UserFlyerDto extends CreateUserFlyerDto {
  _id: string;
  user: string;
}
