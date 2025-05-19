import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { StudentGroupEnvironmentGenerateService } from './../../services/student-group-environment-generate.service';
import { StudentGroupFileService } from './../../services/student-group-file.service';
import {
  Component,
  QueryList,
  signal,
  ViewChildren,
  WritableSignal,
} from '@angular/core';
import { StudentGroup } from '../../models/student-group.model';
import { StudentGroupContainerComponent } from '../student-group-container/student-group-container.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { PdfTemplateType } from '../../models/pdf-template.model';

@Component({
  selector: 'app-student-group-list',
  standalone: true,
  imports: [
    CommonModule,
    StudentGroupContainerComponent,
    NzDropDownModule,
    NzIconModule,
    NzButtonModule,
    NzPageHeaderModule,
  ],
  providers: [NzMessageService, NzModalService],
  template: `
    <nz-page-header [nzTitle]="'เครื่องมือช่วยจัดสิ่งแวดล้อม'"></nz-page-header>
    <div class="layout-container ">
      <!-- Main content area - 90% width -->
      <div class="content-area">
        <div class="page-content">
          @for (group of studentGroups(); track group.id; let idx = $index) {
            <div class="group-item">
              <app-student-group-container
                [groupNo]="idx + 1"
                [groupId]="group.id"
                [groupName]="group.name"
                [groupImage]="group.image"
                [(students)]="group.students"
                (groupChange)="onGroupChange($event)"
              ></app-student-group-container>
            </div>
          }
        </div>
      </div>

      <!-- Sticky action sidebar - 10% width -->
      <div class="action-sidebar">
        <div class="action-buttons">
          <button
            nz-button
            nzType="default"
            (click)="saveAllGroups()"
            class="action-button"
          >
            <span nz-icon nzType="save"></span>
            <span class="button-text">บันทึกข้อมูล</span>
          </button>

          <button
            nz-button
            nzType="default"
            (click)="fileInput.click()"
            class="action-button"
          >
            <span nz-icon nzType="import"></span>
            <span class="button-text">นำเข้าข้อมูล</span>
          </button>

          <input
            type="file"
            style="display: none"
            accept=".json"
            (change)="importFromJson($event)"
            #fileInput
          />

          <button
            nz-button
            nz-dropdown
            [nzDropdownMenu]="pdfMenu"
            nzPlacement="bottomLeft"
            nzType="primary"
            class="action-button"
          >
            <span nz-icon nzType="file-pdf"></span>
            <span class="button-text">ดาวน์โหลด PDF</span>
          </button>

          <nz-dropdown-menu #pdfMenu="nzDropdownMenu">
            <ul nz-menu>
              <li nz-menu-item (click)="getPdf(PdfTemplateType.ENV_01)">
                รูปกลุ่ม
              </li>
              <li nz-menu-item (click)="getPdf(PdfTemplateType.ENV_02)">
                รูปนักเรียนสี่เหลี่ยม
              </li>
              <li nz-menu-item (click)="getPdf(PdfTemplateType.ENV_03)">
                รูปนักเรียนวงกลม
              </li>
              <li nz-menu-item (click)="getPdf(PdfTemplateType.ENV_04)">
                รูปนักเรียน + กลุ่ม ขนาดใหญ่
              </li>
            </ul>
          </nz-dropdown-menu>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .layout-container {
        display: flex;
        max-width: 1200px;
        margin: 0 auto;
        font-family: 'Sarabun', sans-serif;
        height: 100%;
      }

      .content-area {
        flex: 0 0 90%;
        padding: 20px;
        overflow-y: auto;
      }

      .action-sidebar {
        flex: 0 0 10%;
        margin-top: 1rem;
        position: sticky;
        top: 16px;
        align-self: flex-start;
        background-color: #f5f5f5;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 180px); /* Account for header and footer */
        overflow-y: auto;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        padding: 20px 8px;
        gap: 16px;
      }

      .action-button {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px 0;
        height: auto;
      }

      .action-button span[nz-icon] {
        font-size: 20px;
        margin-bottom: 4px;
      }

      .button-text {
        font-size: 12px;
        text-align: center;
      }

      .page-content {
        margin-bottom: 40px;
      }

      .group-item {
        margin-bottom: 30px;
      }

      @media (max-width: 768px) {
        .layout-container {
          flex-direction: column;
        }

        .content-area {
          flex: 1;
          width: 100%;
          padding: 12px;
        }

        .action-sidebar {
          width: 100%;
          position: sticky;
          bottom: 0;
          top: auto;
          height: auto;
          flex: 0;
          border-left: none;
          border-top: 1px solid #e8e8e8;
          z-index: 10;
        }

        .action-buttons {
          flex-direction: row;
          justify-content: space-around;
          padding: 10px;
        }

        .action-button {
          width: auto;
          padding: 8px 12px;
        }
      }
    `,
  ],
})
export class StudentGroupListComponent {
  private latestGroupData: Map<string, StudentGroup> = new Map();

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
    private studentGroupFileService: StudentGroupFileService,
    private studentGroupEnvironmentGenerateService: StudentGroupEnvironmentGenerateService,
  ) {}

  studentGroups: WritableSignal<StudentGroup[]> = signal([]);
  @ViewChildren(StudentGroupContainerComponent)
  groupContainers!: QueryList<StudentGroupContainerComponent>;

  PdfTemplateType = PdfTemplateType;

  ngOnInit() {
    this.studentGroups.set(this.getInitialRowData());
  }

  getInitialRowData(): StudentGroup[] {
    const groupCount = 5;
    let initialRowData: StudentGroup[] = [];
    for (let i = 0; i < groupCount; i++) {
      const group: StudentGroup = {
        id: (i + 1).toString(),
        name: '',
        image: '',
        students: [],
      };
      initialRowData.push(group);
    }
    return initialRowData;
  }

  onGroupChange(updatedGroup: StudentGroup): void {
    const existingGroup = this.latestGroupData.get(updatedGroup.id) || {
      id: updatedGroup.id,
      name: '',
      image: '',
      students: [],
    };

    // Only update the name and image
    existingGroup.name = updatedGroup.name;
    existingGroup.image = updatedGroup.image;

    // Store in map
    this.latestGroupData.set(updatedGroup.id, existingGroup);
  }

  getAllGroups(): StudentGroup[] {
    if (!this.groupContainers) {
      return [];
    }

    // Get current data from all group containers
    return this.groupContainers.map((container) =>
      container.getCurrentGroupData(),
    );
  }

  saveAllGroups(): void {
    const allGroups = this.getAllGroups();
    this.studentGroupFileService.saveGroupsToJson(allGroups);
  }

  importFromJson(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';
    this.modalService.confirm({
      nzTitle: 'ยืนยันการนำเข้าข้อมูล',
      nzContent:
        'การนำเข้าข้อมูลจะแทนที่ข้อมูลปัจจุบันทั้งหมด คุณต้องการดำเนินการต่อหรือไม่?',
      nzOkText: 'ดำเนินการต่อ',
      nzCancelText: 'ยกเลิก',
      nzOnOk: () => this.processImport(file),
    });
  }

  private processImport(file: File): void {
    this.studentGroupFileService.processJsonFile(file).subscribe({
      next: (groups: StudentGroup[]) => {
        this.latestGroupData.clear();
        console.log('Imported groups:', groups);
        this.studentGroups.update(() => groups);

        this.studentGroups().forEach((group) => {
          this.latestGroupData.set(group.id, {
            ...group,
            students: [...group.students],
          });
        });
      },
      error: (error) => console.error('Import error:', error),
    });
  }

  async getPdf(templateType: PdfTemplateType): Promise<void> {
    const allGroups = this.getAllGroups();

    // Create loading message
    const loadingMessage = this.message.loading(`กำลังสร้างเอกสาร...`, {
      nzDuration: 0,
    }).messageId;

    try {
      const result =
        await this.studentGroupEnvironmentGenerateService.generatePdf(
          templateType,
          allGroups,
        );

      if (result) {
        this.message.success(`สร้างเอกสารสำเร็จ`);
      }
    } catch (error) {
      console.error(`Error generating PDF:`, error);
      this.message.error(`เกิดข้อผิดพลาดในการสร้างเอกสาร`);
    } finally {
      this.message.remove(loadingMessage);
    }
  }
}
