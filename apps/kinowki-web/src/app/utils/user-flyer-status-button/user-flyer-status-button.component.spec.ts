import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFlyerStatusButtonComponent } from './user-flyer-status-button.component';

describe('DistributorBadgeComponent', () => {
  let component: UserFlyerStatusButtonComponent;
  let fixture: ComponentFixture<UserFlyerStatusButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFlyerStatusButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFlyerStatusButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
