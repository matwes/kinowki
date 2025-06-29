import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateDistributorDto, DistributorDto, UpdateDistributorDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class DistributorService extends CrudService<DistributorDto, CreateDistributorDto, UpdateDistributorDto> {
  name = 'distributor';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }
}
