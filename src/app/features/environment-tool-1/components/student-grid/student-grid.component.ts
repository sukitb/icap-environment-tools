import { Component, model, OnInit, OnDestroy, effect } from '@angular/core';
import { Student } from '../../models/student.model';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { StudentPrefix } from '../../models/student-prefix.enum';
import { v4 as uuidv4 } from 'uuid';
import { ImageUploadModalComponent } from '../image-upload-modal/image-upload-modal.component';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-student-grid',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzFlexModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
  ],
  templateUrl: './student-grid.component.html',
  styleUrl: './student-grid.component.css',
})
export class StudentGridComponent implements OnInit, OnDestroy {
  students = model<Student[]>([]);
  studentsForm!: FormGroup;
  private valueChangesSubscription: any;

  prefixOptions = [
    { label: StudentPrefix.Mr, value: StudentPrefix.Mr },
    { label: StudentPrefix.Miss, value: StudentPrefix.Miss },
  ];

  constructor(
    private modalService: NzModalService,
    private fb: FormBuilder,
  ) {
    // Add effect to monitor student data changes
    effect(() => {
      const currentStudents = this.students();
      // Check if we need to rebuild the form
      if (
        this.studentsForm &&
        (!this.studentForms ||
          this.studentForms.length !== currentStudents.length)
      ) {
        this.rebuildForm(currentStudents);
      }
    });
  }

  ngOnInit() {
    // Initialize the form
    this.initForm();
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }

  get studentForms(): FormArray {
    return this.studentsForm.get('students') as FormArray;
  }

  getCurrentStudents(): Student[] {
    return this.students();
  }

  getStudentForms(): FormGroup[] {
    return this.studentForms.controls as FormGroup[];
  }

  initForm() {
    // Create a new form group with the students form array
    this.studentsForm = this.fb.group({
      students: this.fb.array([]),
    });

    // Add form groups for existing students
    const currentStudents = this.students();
    currentStudents.forEach((student) => {
      this.studentForms.push(this.createStudentFormGroup(student));
    });

    // Set up valueChanges subscription
    this.setupFormValueChanges();
  }

  setupFormValueChanges() {
    // Clean up any existing subscription first
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }

    // Set up new subscription
    this.valueChangesSubscription = this.studentForms.valueChanges.subscribe(
      (formValues) => {
        // Only process if we have the same number of form values as students
        if (formValues.length === this.students().length) {
          const updatedStudents = formValues.map(
            (formValue: any, index: number) => {
              const originalStudent = this.students()[index];
              return {
                ...originalStudent,
                prefix: formValue.prefix,
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                nickName: formValue.nickName,
              };
            },
          );

          // Check if any values actually changed before updating
          if (
            JSON.stringify(updatedStudents) !== JSON.stringify(this.students())
          ) {
            // Use update instead of set to avoid triggering the effect unnecessarily
            this.students.update(() => updatedStudents);
          }
        }
      },
    );
  }

  rebuildForm(students: Student[]) {
    // Clear existing form array
    if (this.studentForms) {
      while (this.studentForms.length) {
        this.studentForms.removeAt(0);
      }
    }

    // Create new form groups for each student
    students.forEach((student) => {
      if (this.studentForms) {
        this.studentForms.push(this.createStudentFormGroup(student));
      }
    });

    // If the form wasn't initialized yet, initialize it completely
    if (!this.studentsForm) {
      this.initForm();
    }
  }

  createStudentFormGroups(students: Student[]): FormGroup[] {
    return students.map((student) => this.createStudentFormGroup(student));
  }

  createStudentFormGroup(student: Student): FormGroup {
    return this.fb.group({
      prefix: [student.prefix],
      firstName: [student.firstName],
      lastName: [student.lastName],
      nickName: [student.nickName],
    });
  }

  onAddRow() {
    const newStudent: Student = {
      id: uuidv4(),
      image: '',
      imageRound: '',
      prefix: StudentPrefix.Mr,
      firstName: '',
      lastName: '',
      nickName: '',
    };

    // First update the model
    const updatedStudents = [...this.students(), newStudent];
    this.students.set(updatedStudents);

    // Then add the form group (without triggering model updates)
    this.studentForms.push(this.createStudentFormGroup(newStudent));
  }

  deleteRow(index: number) {
    // First remove from the form array (this prevents valueChanges from firing incorrectly)
    this.studentForms.removeAt(index);

    // Then update the model
    const updatedStudents = [...this.students()];
    updatedStudents.splice(index, 1);
    this.students.set(updatedStudents);
  }

  onExport() {
    // Generate CSV data
    const headers = ['image', 'prefix', 'firstName', 'lastName', 'nickName'];
    const csvContent = [
      headers.join(','),
      ...this.students().map((student) =>
        [
          student.image,
          student.prefix,
          student.firstName,
          student.lastName,
          student.nickName,
        ].join(','),
      ),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openImageUpload(index: number, isRound: boolean = false) {
    const student = this.students()[index];

    const modal = this.modalService.create({
      nzTitle: 'อัพโหลดรูปภาพนักเรียน',
      nzContent: ImageUploadModalComponent,
      nzWidth: 700,
      nzFooter: null,
      nzData: {
        initialImage: isRound ? student.imageRound : student.image,
        config: {
          mode: 'student',
          title: isRound ? 'ครอปรูปภาพวงกลม' : 'ครอปรูปภาพ',
        },
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.image) {
        this.students.update((students) => {
          return students.map((s, i) => {
            if (i === index) {
              // Always update both image and imageRound with the same image
              return {
                ...s,
                image: result.image,
                imageRound: result.roundImage,
              };
            }
            return s;
          });
        });
      }
    });
  }
}
