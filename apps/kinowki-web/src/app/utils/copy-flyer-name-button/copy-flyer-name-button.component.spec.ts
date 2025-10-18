import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyFlyerNameButtonComponent } from './copy-flyer-name-button.component';

describe('CopyFlyerNameButtonComponent', () => {
  let component: CopyFlyerNameButtonComponent;
  let fixture: ComponentFixture<CopyFlyerNameButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyFlyerNameButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CopyFlyerNameButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
