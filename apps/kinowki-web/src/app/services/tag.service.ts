import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateTagDto, TagDto, UpdateTagDto } from '@kinowki/shared';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class TagService extends CrudService<TagDto, CreateTagDto, UpdateTagDto> {
  name = 'tag';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }
}
