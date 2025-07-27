import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlyerDialogComponent } from './flyer-dialog.component';

describe('FilmDialogComponent', () => {
  let component: FlyerDialogComponent;
  let fixture: ComponentFixture<FlyerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlyerDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlyerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
