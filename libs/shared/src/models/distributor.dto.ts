export interface CreateDistributorDto {
  name: string;
}

export interface UpdateDistributorDto extends Partial<CreateDistributorDto> {
  _id: string;
  releasesCount?: number;
  pastReleasesCount?: number;
  pastReleasesWithFlyersCount?: number;
  pastReleasesWithFlyersPercent?: number;
  flyerProbability?: number;
  firstYear?: number;
  lastYear?: number;

}

export interface DistributorDto extends CreateDistributorDto {
  _id: string;
  releasesCount: number;
  pastReleasesCount: number;
  pastReleasesWithFlyersCount: number;
  pastReleasesWithFlyersPercent: number;
  flyerProbability: number;
  firstYear: number;
  lastYear: number;
}
