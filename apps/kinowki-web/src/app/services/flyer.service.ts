import { Injectable } from '@angular/core';
import { CreateFlyerDto, FlyerDto, UpdateFlyerDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class FlyerService extends CrudService<FlyerDto, CreateFlyerDto, UpdateFlyerDto> {
  name = 'flyer';
}
