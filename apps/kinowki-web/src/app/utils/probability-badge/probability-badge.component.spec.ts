import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProbabilityBadgeComponent } from './probability-badge.component';

describe('ProbabilityBadgeComponent', () => {
  let component: ProbabilityBadgeComponent;
  let fixture: ComponentFixture<ProbabilityBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbabilityBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProbabilityBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
