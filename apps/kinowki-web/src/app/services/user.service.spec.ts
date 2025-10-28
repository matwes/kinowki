import { TestBed } from '@angular/core/testing';

import { UserFlyerService } from './user-flyer.service';

describe('UserFlyerService', () => {
  let service: UserFlyerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserFlyerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
