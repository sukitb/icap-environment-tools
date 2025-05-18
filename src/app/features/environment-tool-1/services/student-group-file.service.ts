import { NzMessageService } from 'ng-zorro-antd/message';
import { Injectable } from '@angular/core';
import { StudentGroup } from '../models/student-group.model';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentGroupFileService {
  constructor(private message: NzMessageService) {}

  saveGroupsToJson(groups: StudentGroup[]): void {
    try {
      const jsonString = JSON.stringify(groups, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `env-tool-1-input-${new Date().toISOString().split('T')[0]}.json`;

      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      this.message.success('บันทึกข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      this.message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  }

  processJsonFile(file: File): Observable<StudentGroup[]> {
    if (
      !file ||
      (file.type !== 'application/json' && !file.name.endsWith('.json'))
    ) {
      this.message.error('กรุณาเลือกไฟล์ JSON เท่านั้น');
      return throwError(() => new Error('Invalid file type'));
    }

    return new Observable((observer) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          // Validate the JSON structure
          if (!Array.isArray(jsonData)) {
            throw new Error('ข้อมูลต้องอยู่ในรูปแบบ Array');
          }

          // Validate each group and student
          this.validateGroupData(jsonData);

          observer.next(jsonData);
          observer.complete();

          this.message.success('นำเข้าข้อมูลสำเร็จ');
        } catch (error) {
          console.error('Error importing JSON:', error);
          observer.error(error);
          this.message.error(
            error instanceof Error
              ? error.message
              : 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
          );
        }
      };

      reader.onerror = () => {
        this.message.error('เกิดข้อผิดพลาดในการอ่านไฟล์');
        observer.error(new Error('File reading error'));
      };

      reader.readAsText(file);
    });
  }

  private validateGroupData(groups: any[]): void {
    for (const group of groups) {
      if (!('id' in group) || !('name' in group) || !('students' in group)) {
        throw new Error('โครงสร้างข้อมูลไม่ถูกต้อง: ไม่พบ key ที่จำเป็น');
      }

      if (!Array.isArray(group.students)) {
        throw new Error('โครงสร้างข้อมูลไม่ถูกต้อง: students ต้องเป็น Array');
      }

      // Validate student structure
      for (const student of group.students) {
        if (
          !('id' in student) ||
          !('firstName' in student) ||
          !('lastName' in student)
        ) {
          throw new Error(
            'โครงสร้างข้อมูลนักเรียนไม่ถูกต้อง: ไม่พบ key ที่จำเป็น',
          );
        }
      }
    }
  }
}
