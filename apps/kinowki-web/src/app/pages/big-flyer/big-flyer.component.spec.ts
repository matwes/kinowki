import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BigFlyerComponent } from './big-flyer.component';

describe('BigFlyerComponent', () => {
  let component: BigFlyerComponent;
  let fixture: ComponentFixture<BigFlyerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigFlyerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BigFlyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
