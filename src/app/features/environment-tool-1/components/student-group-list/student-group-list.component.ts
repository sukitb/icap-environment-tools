import {
  Component,
  effect,
  Inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { StudentGroup } from '../../models/student-group.model';
import { StudentGroupContainerComponent } from '../student-group-container/student-group-container.component';
import { StudentPrefix } from '../../models/student-prefix.enum';
import { mockStudents } from '../student-grid/grid-config/students.mock';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-student-group-list',
  imports: [StudentGroupContainerComponent],
  providers: [NzMessageService, NzModalService],
  template: ` @for (
    group of studentGroups();
    track group.id;
    let idx = $index
  ) {
    <div class="group-item"></div>
    <app-student-group-container
      [groupNo]="idx + 1"
      [groupId]="group.id"
      [groupName]="group.name"
      [groupImage]="group.image"
      [students]="group.students"
      (groupChange)="onGroupChange($event)"
    ></app-student-group-container>
    <div class="actions-container">
      <button nz-button nzType="primary" (click)="saveAllGroups()">
        <span nz-icon nzType="download"></span>บันทึกเป็น JSON
      </button>

      <button nz-button (click)="fileInput.click()">
        <span nz-icon nzType="upload"></span>นำเข้าจาก JSON
      </button>
      <input
        type="file"
        style="display: none"
        accept=".json"
        (change)="importFromJson($event)"
        #fileInput
      />
    </div>
  }`,
  styleUrl: './student-group-list.component.css',
})
export class StudentGroupListComponent {
  private latestGroupData: Map<string, StudentGroup> = new Map();

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
  ) {
    effect(() => {
      console.log('Student groups updated:', this.studentGroups());
    });
  }

  studentGroups: WritableSignal<StudentGroup[]> = signal([
    {
      id: '1',
      name: 'สวัสดีครับ',
      image: '',
      students: [],
    },
    {
      id: '2',
      name: 'กลุ่มที่ 2',
      image: '',
      students: [],
    },
  ]);

  ngOnInit() {
    // Initialize the map with the initial data
    this.studentGroups().forEach((group) => {
      this.latestGroupData.set(group.id, {
        ...group,
        students: [...group.students],
      });
    });
  }

  onGroupChange(updatedGroup: StudentGroup): void {
    // Update our tracking map
    this.latestGroupData.set(updatedGroup.id, updatedGroup);
  }

  // Method to get all the latest data
  getAllGroups(): StudentGroup[] {
    return Array.from(this.latestGroupData.values());
  }

  saveAllGroups(): void {
    try {
      const allGroups = this.getAllGroups();

      // Create a JSON string with proper formatting
      const jsonString = JSON.stringify(allGroups, null, 2);

      // Create a blob with the JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a download URL
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `student-groups-${new Date().toISOString().split('T')[0]}.json`;

      // Trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      this.message.success('บันทึกข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      this.message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  }

  // Import data from JSON file
  importFromJson(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Reset the file input to allow selecting the same file again
    event.target.value = '';

    // Check file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      this.message.error('กรุณาเลือกไฟล์ JSON เท่านั้น');
      return;
    }

    // Confirm import
    this.modalService.confirm({
      nzTitle: 'ยืนยันการนำเข้าข้อมูล',
      nzContent:
        'การนำเข้าข้อมูลจะแทนที่ข้อมูลปัจจุบันทั้งหมด คุณต้องการดำเนินการต่อหรือไม่?',
      nzOkText: 'ดำเนินการต่อ',
      nzCancelText: 'ยกเลิก',
      nzOnOk: () => this.processJsonFile(file),
    });
  }

  private processJsonFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        // Validate the JSON structure
        if (!Array.isArray(jsonData)) {
          throw new Error('ข้อมูลต้องอยู่ในรูปแบบ Array');
        }

        // Basic validation of group structure
        for (const group of jsonData) {
          if (!group.id || !group.name || !Array.isArray(group.students)) {
            throw new Error('โครงสร้างข้อมูลไม่ถูกต้อง');
          }

          // Validate student structure
          for (const student of group.students) {
            if (!student.id || !student.firstName || !student.lastName) {
              throw new Error('โครงสร้างข้อมูลนักเรียนไม่ถูกต้อง');
            }
          }
        }

        // Reset existing data
        this.latestGroupData.clear();

        console.log('Imported JSON data:', jsonData);

        // Update the student groups with the imported data
        this.studentGroups.update(() => jsonData);

        // Reinitialize the map
        this.studentGroups().forEach((group) => {
          this.latestGroupData.set(group.id, {
            ...group,
            students: [...group.students],
          });
        });

        this.message.success('นำเข้าข้อมูลสำเร็จ');
      } catch (error) {
        console.error('Error importing JSON:', error);
        this.message.error(
          error instanceof Error
            ? error.message
            : 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
        );
      }
    };

    reader.onerror = () => {
      this.message.error('เกิดข้อผิดพลาดในการอ่านไฟล์');
    };

    reader.readAsText(file);
  }
}
