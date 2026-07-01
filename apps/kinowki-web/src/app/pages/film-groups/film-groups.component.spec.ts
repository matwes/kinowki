import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmGroupsComponent } from './film-groups.component';

describe('FilmGroupsComponent', () => {
  let component: FilmGroupsComponent;
  let fixture: ComponentFixture<FilmGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmGroupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilmGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
