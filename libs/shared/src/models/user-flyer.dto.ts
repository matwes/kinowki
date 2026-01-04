export enum UserFlyerStatus {
  HAVE = 0,
  TRADE = 1,
  WANT = 2,
  UNWANTED = 3,
}

export enum UserFlyerFilter {
  HAVE = 'have',
  TRADE = 'trade',
  TRADE_MATCH = 'trade-match',
  WANT = 'want',
  WANT_MATCH = 'want-match',
}

export interface CreateUserFlyerDto {
  user?: string;
  flyer: string;
  flyerName: string;
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
