import { TestBed } from '@angular/core/testing';

import { UserOfferService } from './user-offer.service';

describe('UserOfferService', () => {
  let service: UserOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
