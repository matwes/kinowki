import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateReleaseDto, ReleaseDto, UpdateReleaseDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class ReleaseService extends CrudService<ReleaseDto, CreateReleaseDto, UpdateReleaseDto> {
  name = 'release';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }
}
