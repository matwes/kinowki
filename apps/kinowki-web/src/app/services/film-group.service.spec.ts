import { TestBed } from '@angular/core/testing';

import { FilmGroupService } from './film-group.service';

describe('FilmGroupService', () => {
  let service: FilmGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilmGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
