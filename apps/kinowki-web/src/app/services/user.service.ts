import { Injectable } from '@angular/core';
import { CreateUserDto, UpdateUserDto, UserDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends CrudService<UserDto, CreateUserDto, UpdateUserDto> {
  name = 'user';
}
