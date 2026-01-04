export interface CreateUserOfferDto {
  userTrade: string;
  userWant: string;
  count: number;
}

export interface UpdateUserOfferDto extends Partial<CreateUserOfferDto> {
  _id?: string;
}

export interface UserOfferDto extends CreateUserOfferDto {
  _id: string;
}
