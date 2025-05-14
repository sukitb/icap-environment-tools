import { StudentGroupEnvironmentGenerateService } from './../../services/student-group-environment-generate.service';
import { StudentGroupFileService } from './../../services/student-group-file.service';
import {
  Component,
  ElementRef,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { StudentGroup } from '../../models/student-group.model';
import { StudentGroupContainerComponent } from '../student-group-container/student-group-container.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
@Component({
  selector: 'app-student-group-list',
  imports: [
    StudentGroupContainerComponent,
    NzPageHeaderModule,
    NzSpaceModule,
    NzDropDownModule,
    NzIconModule,
  ],
  providers: [NzMessageService, NzModalService],
  template: `
    <div class="fixed-header" #header>
      <nz-page-header
        class="site-page-header"
        nzTitle="การจัดกลุ่มนักเรียน"
        [nzGhost]="false"
      >
        <nz-page-header-extra>
          <nz-space>
            <button
              *nzSpaceItem
              nz-button
              nzType="primary"
              (click)="saveAllGroups()"
            >
              <span nz-icon nzType="download"></span> บันทึก JSON
            </button>
            <button *nzSpaceItem nz-button (click)="fileInput.click()">
              <span nz-icon nzType="upload"></span> นำเข้า JSON
            </button>
            <input
              type="file"
              style="display: none"
              accept=".json"
              (change)="importFromJson($event)"
              #fileInput
            />
            <!-- <button *nzSpaceItem nz-button nzType="default" (click)="getPdf()">
              <span nz-icon nzType="file-pdf"></span> กลุ่ม
            </button>
            <button *nzSpaceItem nz-button nzType="default" (click)="getPdf()">
              <span nz-icon nzType="file-pdf"></span>
            </button> -->
            <button
              *nzSpaceItem
              nz-button
              nz-dropdown
              [nzDropdownMenu]="pdfMenu"
              nzPlacement="bottomRight"
            >
              <span nz-icon nzType="file-pdf"></span> ดาวน์โหลด PDF
              <nz-icon nzType="down" />
            </button>
            <nz-dropdown-menu #pdfMenu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item (click)="getPdf('env-01')">กลุ่ม</li>
                <li nz-menu-item (click)="getPdf('env-02')">
                  รูปนักเรียนสี่เหลี่ยม
                </li>
                <li nz-menu-item (click)="getPdf('env-03')">
                  รูปนักเรียนวงกลม
                </li>
                <li nz-menu-item (click)="getPdf('env-04')">
                  รูปนักเรียน + กลุ่ม ขนาดใหญ่
                </li>
              </ul>
            </nz-dropdown-menu>
          </nz-space>
        </nz-page-header-extra>
      </nz-page-header>
    </div>

    <div class="page-container" #pageContainer>
      <div class="page-content">
        @for (group of studentGroups(); track group.id; let idx = $index) {
          <div class="group-item">
            <app-student-group-container
              [groupNo]="idx + 1"
              [groupId]="group.id"
              [groupName]="group.name"
              [groupImage]="group.image"
              [students]="group.students"
              (groupChange)="onGroupChange($event)"
            ></app-student-group-container>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .fixed-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        background-color: #fff;
      }

      .site-page-header {
        background-color: #fff;
        padding: 16px 24px;
      }

      .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Sarabun', sans-serif;
        margin-top: 80px;
      }

      .page-content {
        margin-bottom: 40px;
      }

      .group-item {
        margin-bottom: 30px;
      }

      @media (max-width: 768px) {
        .site-page-header {
          padding: 12px 16px;
        }

        .page-container {
          padding: 12px;
          margin-top: 110px;
        }
      }
    `,
  ],
})
export class StudentGroupListComponent {
  private latestGroupData: Map<string, StudentGroup> = new Map();
  @ViewChild('header') headerElement!: ElementRef;
  @ViewChild('pageContainer') pageContainer!: ElementRef;

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
    private studentGroupFileService: StudentGroupFileService,
    private studentGroupEnvironmentGenerateService: StudentGroupEnvironmentGenerateService,
  ) {}

  studentGroups: WritableSignal<StudentGroup[]> = signal([]);

  ngOnInit() {
    // this.studentGroups().forEach((group) => {
    //   this.latestGroupData.set(group.id, {
    //     ...group,
    //     students: [...group.students],
    //   });
    // });
    this.studentGroups.set(this.getInitialRowData());
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const headerHeight = this.headerElement.nativeElement.offsetHeight;
      const containerElement = this.pageContainer.nativeElement as HTMLElement;
      containerElement.style.marginTop = `${headerHeight + 15}px`;
    }, 0);
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
    this.latestGroupData.set(updatedGroup.id, updatedGroup);
  }

  getAllGroups(): StudentGroup[] {
    // Get the current groups from the signal
    const currentGroups = this.studentGroups();

    // Make sure all current groups are in the latestGroupData Map
    currentGroups.forEach((group) => {
      if (!this.latestGroupData.has(group.id)) {
        // If a group hasn't been edited yet, add it to the map
        this.latestGroupData.set(group.id, {
          ...group,
          students: [...group.students],
        });
      }
    });

    // Return all groups from the map
    return Array.from(this.latestGroupData.values());
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

  async getPdf(
    envType: 'env-01' | 'env-02' | 'env-03' | 'env-04',
  ): Promise<void> {
    const allGroups = this.getAllGroups();

    // Create a map of form types to their Thai names for better messages
    const formNames = {
      'env-01': 'กลุ่ม',
      'env-02': 'รูปนักเรียนสี่เหลี่ยม',
      'env-03': 'รูปนักเรียนวงกลม',
      'env-04': 'รูปนักเรียน + กลุ่ม ขนาดใหญ่',
    };

    // Create loading message
    const loadingMessage = this.message.loading(
      `กำลังสร้าง ${formNames[envType]}...`,
      { nzDuration: 0 }, // Set duration to 0 to persist until manually removed
    ).messageId;

    try {
      // Call the appropriate PDF generation method
      let result;
      if (envType === 'env-01') {
        result =
          await this.studentGroupEnvironmentGenerateService.generateEnv01Pdf(
            allGroups,
          );
      } else if (envType === 'env-02') {
        result =
          await this.studentGroupEnvironmentGenerateService.generateEnv02Pdf(
            allGroups,
          );
      } else if (envType === 'env-03') {
        result =
          await this.studentGroupEnvironmentGenerateService.generateEnv03Pdf(
            allGroups,
          );
      } else if (envType === 'env-04') {
        result =
          await this.studentGroupEnvironmentGenerateService.generateEnv04Pdf(
            allGroups,
          );
      }

      // Show success message if generation was successful
      if (result) {
        this.message.success(`${formNames[envType]} สร้างสำเร็จ`);
      }
    } catch (error) {
      console.error(`Error generating ${envType}:`, error);
      this.message.error(`เกิดข้อผิดพลาดในการสร้าง ${formNames[envType]}`);
    } finally {
      // Remove loading message regardless of success or failure
      this.message.remove(loadingMessage);
    }
  }
}
