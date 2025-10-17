export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  importUsed?: boolean;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  _id?: string;
}

export interface UserDto extends CreateUserDto {
  _id: string;
  importUsed: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}
