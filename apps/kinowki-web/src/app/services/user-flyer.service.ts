import { Injectable } from '@angular/core';
import { CreateUserFlyerDto, UpdateUserFlyerDto, UserFlyerDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class UserFlyerService extends CrudService<UserFlyerDto, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user-flyer';
}
