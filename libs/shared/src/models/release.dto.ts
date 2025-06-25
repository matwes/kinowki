export interface CreateReleaseDto {
  film: string;
  date: Date;
  distributors: string[];
  note?: string;
}

export interface UpdateReleaseDto extends Partial<CreateReleaseDto> {
  _id: string;
}

export interface ReleaseDto extends CreateReleaseDto {
  _id: string;
}
