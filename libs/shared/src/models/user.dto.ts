export interface CreateUserDto {
  name: string;
  flyers: string[];
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  _id: string;
}

export interface UserDto extends CreateUserDto {
  _id: string;
}
