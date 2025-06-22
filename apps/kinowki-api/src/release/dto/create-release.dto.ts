export class CreateReleaseDto {
  readonly film: string;
  readonly date: Date;
  readonly distributors: string[];
  readonly note?: string;
}
