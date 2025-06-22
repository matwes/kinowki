export class CreateFlyerDto {
  readonly type: string;
  readonly size: string;
  readonly tags: string[];
  readonly note?: string;
  readonly releases: string[];
}
