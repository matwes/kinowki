import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistributorBadgeComponent } from './distributor-badge.component';

describe('DistributorBadgeComponent', () => {
  let component: DistributorBadgeComponent;
  let fixture: ComponentFixture<DistributorBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributorBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DistributorBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
