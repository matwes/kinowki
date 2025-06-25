export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto extends Partial<CreateTagDto> {
  _id: string;
}

export interface TagDto extends CreateTagDto {
  _id: string;
}
