export interface CreateDistributorDto {
  name: string;
}

export interface UpdateDistributorDto extends Partial<CreateDistributorDto> {
  _id: string;
}

export interface DistributorDto extends CreateDistributorDto {
  _id: string;
}
