import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistributorDialogComponent } from './distributor-dialog.component';

describe('DistributorDialogComponent', () => {
  let component: DistributorDialogComponent;
  let fixture: ComponentFixture<DistributorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributorDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DistributorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
