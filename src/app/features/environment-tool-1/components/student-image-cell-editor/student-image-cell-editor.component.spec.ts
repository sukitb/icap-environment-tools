import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentImageCellEditorComponent } from './student-image-cell-editor.component';

describe('StudentImageCellEditorComponent', () => {
  let component: StudentImageCellEditorComponent;
  let fixture: ComponentFixture<StudentImageCellEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentImageCellEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentImageCellEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
