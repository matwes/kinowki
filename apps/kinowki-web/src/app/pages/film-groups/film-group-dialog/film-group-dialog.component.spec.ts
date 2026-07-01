import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmGroupDialogComponent } from './film-group-dialog.component';

describe('FilmGroupDialogComponent', () => {
  let component: FilmGroupDialogComponent;
  let fixture: ComponentFixture<FilmGroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmGroupDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilmGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
