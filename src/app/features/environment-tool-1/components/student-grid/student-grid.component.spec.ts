import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGridComponent } from './student-grid.component';

describe('StudentGridComponent', () => {
  let component: StudentGridComponent;
  let fixture: ComponentFixture<StudentGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
