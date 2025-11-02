import { Injectable } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/table';
import { CreateUserFlyerDto, FlyerDto, UpdateUserFlyerDto, UserFlyerDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class UserFlyerService extends CrudService<UserFlyerDto, CreateUserFlyerDto, UpdateUserFlyerDto> {
  name = 'user-flyer';

  getFlyers(params?: TableLazyLoadEvent) {
    return this.httpClient.get<{
      message: string;
      data: FlyerDto[];
      totalRecords: number;
    }>(this.url, { params: this.buildQueryParams(params) });
  }
}
