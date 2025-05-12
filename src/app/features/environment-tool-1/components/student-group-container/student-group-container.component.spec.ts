import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGroupContainerComponent } from './student-group-container.component';

describe('StudentGroupContainerComponent', () => {
  let component: StudentGroupContainerComponent;
  let fixture: ComponentFixture<StudentGroupContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentGroupContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentGroupContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
