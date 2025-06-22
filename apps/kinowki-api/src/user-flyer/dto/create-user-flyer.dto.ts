export class CreateUserFlyerDto {
  readonly flyer: string;
  readonly collection: boolean;
  readonly exchange: boolean;
  readonly wanted: boolean;
  readonly notInterested: boolean;
  readonly count: number;
}
