import {
  Component,
  computed,
  EventEmitter,
  Input,
  input,
  linkedSignal,
  model,
  Output,
  signal,
} from '@angular/core';
import { StudentGridComponent } from '../student-grid/student-grid.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { ImageUploadModalComponent } from '../image-upload-modal/image-upload-modal.component';
import { Student } from '../../models/student.model';
import { StudentGroup } from '../../models/student-group.model';

@Component({
  selector: 'app-student-group-container',
  standalone: true,
  imports: [
    CommonModule,
    StudentGridComponent,
    NzCardModule,
    NzFormModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzUploadModule,
    NzAvatarModule,
    NzIconModule,
  ],
  providers: [NzModalService],
  template: `
    <nz-card [nzTitle]="groupLabel()">
      <div class="group-header">
        <div class="group-image-container">
          <div class="group-image" (click)="openImageUpload()">
            <ng-container *ngIf="groupImage(); else noImage">
              <nz-avatar
                [nzSize]="120"
                nzShape="square"
                [nzSrc]="groupImage()"
                class="group-avatar"
              >
              </nz-avatar>
            </ng-container>
            <ng-template #noImage>
              <nz-avatar
                [nzSize]="120"
                nzShape="square"
                [nzIcon]="'picture'"
                class="upload-placeholder"
              >
              </nz-avatar>
            </ng-template>
            <div class="upload-overlay">
              <span nz-icon nzType="camera" nzTheme="outline"></span>
            </div>
          </div>
        </div>

        <div class="group-info">
          <form nz-form [nzLayout]="'inline'">
            <nz-form-item>
              <nz-form-label>ชื่อกลุ่ม</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  [ngModel]="groupName()"
                  (ngModelChange)="onGroupNameChange($event)"
                  name="groupName"
                  required
                />
              </nz-form-control>
            </nz-form-item>
          </form>
        </div>
      </div>

      <div class="group-content">
        <app-student-grid
          [students]="students()"
          (studentsChange)="onStudentsChange($event)"
        ></app-student-grid>
      </div>
    </nz-card>
  `,
  styles: [
    `
      .group-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }

      .group-image-container {
        margin-right: 20px;
      }

      .group-image {
        position: relative;
        cursor: pointer;
        width: 120px;
        height: 120px;
        border-radius: 4px;
        overflow: hidden;
      }

      .group-avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .upload-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        color: #999;
      }

      .upload-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .upload-overlay span {
        color: white;
        font-size: 24px;
      }

      .group-image:hover .upload-overlay {
        opacity: 1;
      }

      .group-info {
        flex: 1;
      }
    `,
  ],
})
export class StudentGroupContainerComponent {
  groupId = model<string>('');
  groupNo = model<number>(0);
  groupName = model<string>('');
  groupImage = model<string>('');
  students = model<Student[]>([]);

  @Output() groupChange = new EventEmitter<StudentGroup>();

  constructor(private modalService: NzModalService) {}

  ngOnInit(): void {
    // this.groupName.set(this.initialGroupName());
    // this.groupImage.set(this.initialGroupImage);
    // this.students.set([...this.initialStudents()]);
  }

  private emitGroupChange(): void {
    this.groupChange.emit({
      id: this.groupId(),
      name: this.groupName(),
      image: this.groupImage(),
      students: this.students(),
    });
  }

  onGroupNameChange(name: string): void {
    this.groupName.set(name);
    this.emitGroupChange();
  }

  groupLabel = computed(() => {
    return `กลุ่มที่ ${this.groupNo()} : ${this.groupName()}`;
  });

  onStudentsChange(updatedStudents: Student[]): void {
    this.students.set(updatedStudents);
    this.emitGroupChange();
  }

  openImageUpload(): void {
    const modal = this.modalService.create({
      nzTitle: 'อัพโหลดรูปภาพกลุ่ม',
      nzContent: ImageUploadModalComponent,
      nzWidth: 700,
      nzFooter: null,
      nzData: {
        initialImage: this.groupImage(),
        config: {
          mode: 'group',
          title: 'ครอปรูปภาพกลุ่ม (อัตราส่วน 1:1)',
        },
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.image) {
        this.groupImage.set(result.image);
        this.emitGroupChange();
      }
    });
  }
}
