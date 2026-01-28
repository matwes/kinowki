export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  haveTotal?: number;
  tradeTotal?: number;
  wantTotal?: number;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  _id?: string;
}

export interface UserDto extends CreateUserDto {
  _id: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}
