import { TestBed } from '@angular/core/testing';

import { UnmarkedFlyersService } from './unmarked-flyers.service';

describe('UnmarkedFlyersService', () => {
  let service: UnmarkedFlyersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnmarkedFlyersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
