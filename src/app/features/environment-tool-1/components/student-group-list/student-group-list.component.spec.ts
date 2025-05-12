import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGroupListComponent } from './student-group-list.component';

describe('StudentGroupListComponent', () => {
  let component: StudentGroupListComponent;
  let fixture: ComponentFixture<StudentGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentGroupListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
