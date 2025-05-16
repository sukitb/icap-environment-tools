import { StudentGroup } from './../models/student-group.model';
import { Injectable } from '@angular/core';
import { PdfGenerateService } from '../../../core/services/pdf-generate/pdf-generate.service';
import env01Template from '../pdf-template/env-01.json';
import env02Template from '../pdf-template/env-02.json';
import env03Template from '../pdf-template/env-03.json';
import env04Template from '../pdf-template/env-04.json';
import env01v2Template from '../pdf-template/env-01v2.json';
import { Template } from '@pdfme/common';
import { Student } from '../models/student.model';
import { merge } from '@pdfme/manipulator'; // Add this import
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Injectable({
  providedIn: 'root',
})
export class StudentGroupEnvironmentGenerateService {
  constructor(
    private pdfGenerateService: PdfGenerateService,
    private message: NzMessageService,
  ) {}

  async generateEnv01Pdf(studentGroups: StudentGroup[]) {
    const template = env01v2Template;
    const inputs = this.transformStudentGroupsToEn01Inputs(studentGroups);
    const name = `รูปกลุ่ม`;
    const result = await this.pdfGenerateService.generatePdf(
      template,
      [inputs],
      name,
    );
    if (result) {
      console.log('PDF generated successfully');
    }
    // Handle the result of the PDF generation
    // For example, show a success message or handle errors
    // this.message.success('PDF generated successfully');
  }

  async generateEnv02Pdf(studentGroups: StudentGroup[]) {
    const template = env02Template;
    // Note: now we're getting an array of input objects (one per page)
    const paginatedInputs =
      await this.transformStudentGroupsToEn02Inputs(studentGroups);
    const name = `รูปนักเรียนสี่เหลี่ยม`;

    console.log('Paginated Inputs:', paginatedInputs);

    if (!paginatedInputs || paginatedInputs.length === 0) {
      this.message.warning('กรุณาเพิ่มข้อมูลก่อน');
      return false;
    }

    const pageBlobs = await Promise.all(
      paginatedInputs.map(async (pageInputs, index) => {
        console.log(`Page ${index + 1} Inputs:`, pageInputs);
        return await this.pdfGenerateService.createPdfBlob(template, [
          pageInputs,
        ]);
      }),
    );

    try {
      // Convert Blobs to ArrayBuffers
      const pdfArrayBuffers = await Promise.all(
        pageBlobs.map((blob) => blob.arrayBuffer()),
      );

      // Merge PDFs
      const mergedPdfArrayBuffer = await merge(pdfArrayBuffers);

      // Convert merged ArrayBuffer back to Blob
      const mergedPdfBlob = new Blob([mergedPdfArrayBuffer], {
        type: 'application/pdf',
      });

      // Download the merged PDF
      this.pdfGenerateService.downloadBlob(mergedPdfBlob, `${name}.pdf`);

      console.log('Successfully merged and downloaded PDF');
      return true;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      return false;
    }
  }

  async generateEnv03Pdf(studentGroups: StudentGroup[]) {
    const template = env03Template;
    // Note: now we're getting an array of input objects (one per page)
    const paginatedInputs =
      await this.transformStudentGroupsToEn03Inputs(studentGroups);
    const name = `รูปนักเรียนวงกลม`;

    console.log('Paginated Inputs:', paginatedInputs);
    if (!paginatedInputs || paginatedInputs.length === 0) {
      this.message.warning('กรุณาเพิ่มข้อมูลก่อน');
      return false;
    }

    const pageBlobs = await Promise.all(
      paginatedInputs.map(async (pageInputs, index) => {
        console.log(`Page ${index + 1} Inputs:`, pageInputs);
        return await this.pdfGenerateService.createPdfBlob(template, [
          pageInputs,
        ]);
      }),
    );

    try {
      // Convert Blobs to ArrayBuffers
      const pdfArrayBuffers = await Promise.all(
        pageBlobs.map((blob) => blob.arrayBuffer()),
      );

      // Merge PDFs
      const mergedPdfArrayBuffer = await merge(pdfArrayBuffers);

      // Convert merged ArrayBuffer back to Blob
      const mergedPdfBlob = new Blob([mergedPdfArrayBuffer], {
        type: 'application/pdf',
      });

      // Download the merged PDF
      this.pdfGenerateService.downloadBlob(mergedPdfBlob, `${name}.pdf`);

      console.log('Successfully merged and downloaded PDF');
      return true;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      return false;
    }
  }

  async generateEnv04Pdf(studentGroups: StudentGroup[]) {
    const template = env04Template;
    const paginatedInputs =
      await this.transformStudentGroupsToEn04Inputs(studentGroups);

    if (!paginatedInputs || paginatedInputs.length === 0) {
      this.message.warning('กรุณาเพิ่มข้อมูลก่อน');
      return false;
    }
    const name = `env-04-${new Date().toISOString().split('T')[0]}`;
    const pageBlobs = await Promise.all(
      paginatedInputs.map(async (pageInputs, index) => {
        console.log(`Page ${index + 1} Inputs:`, pageInputs);
        return await this.pdfGenerateService.createPdfBlob(template, [
          pageInputs,
        ]);
      }),
    );
    try {
      // Convert Blobs to ArrayBuffers
      const pdfArrayBuffers = await Promise.all(
        pageBlobs.map((blob) => blob.arrayBuffer()),
      );

      // Merge PDFs
      const mergedPdfArrayBuffer = await merge(pdfArrayBuffers);

      // Convert merged ArrayBuffer back to Blob
      const mergedPdfBlob = new Blob([mergedPdfArrayBuffer], {
        type: 'application/pdf',
      });

      // Download the merged PDF
      this.pdfGenerateService.downloadBlob(
        mergedPdfBlob,
        `รูปนักเรียน + กลุ่ม ขนาดใหญ่.pdf`,
      );

      console.log('Successfully merged and downloaded PDF');
      return true;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      return false;
    }
  }

  private transformStudentGroupsToEn01Inputs(
    studentGroups: StudentGroup[],
  ): Record<string, any> {
    const result: Record<string, any> = {};

    const maxGroups = 5;

    // Process each group up to the maximum limit
    for (let i = 0; i < Math.min(studentGroups.length, maxGroups); i++) {
      const group = studentGroups[i];
      const groupIndex = i + 1; // 1-based index for template fields

      // Dynamically set properties using bracket notation
      result[`text${groupIndex}`] = `กลุ่ม ${group.name}`;
      result[`image${groupIndex}`] = group.image || ''; // Use empty string as fallback
    }

    // Fill in empty values for unused template fields
    for (let i = studentGroups.length + 1; i <= maxGroups; i++) {
      result[`text${i}`] = '';
      result[`image${i}`] = '';
    }

    return result;
  }

  async transformStudentGroupsToEn02Inputs(
    studentGroups: StudentGroup[],
  ): Promise<Record<string, any>[]> {
    // Get all students from all groups into a flat array
    const allStudents: Student[] = studentGroups.flatMap(
      (group) => group.students || [],
    );

    // Calculate how many pages we need (25 students per page)
    const studentsPerPage = 25;
    const numberOfPages = Math.ceil(allStudents.length / studentsPerPage);

    // Create an array to hold inputs for each page
    const paginatedInputs: Record<string, any>[] = [];

    // Process each page
    for (let pageIndex = 0; pageIndex < numberOfPages; pageIndex++) {
      const pageInputs: Record<string, any> = {};

      // Calculate the start and end indices for students on this page
      const startIndex = pageIndex * studentsPerPage;
      const endIndex = Math.min(
        startIndex + studentsPerPage,
        allStudents.length,
      );

      // Process students for this page
      for (let i = startIndex; i < endIndex; i++) {
        const student = allStudents[i];
        // The image index resets for each page (1-25)
        const imageIndex = i - startIndex + 1;

        // Set student image - use the regular image, not the round one
        pageInputs[`image${imageIndex}`] = student.image || '';
      }

      // Fill in empty values for unused student image fields on this page
      const studentsOnThisPage = endIndex - startIndex;
      for (let i = studentsOnThisPage + 1; i <= studentsPerPage; i++) {
        pageInputs[`image${i}`] = '';
      }

      // Add this page's inputs to our array
      paginatedInputs.push(pageInputs);
    }

    return paginatedInputs;
  }

  async transformStudentGroupsToEn03Inputs(
    studentGroups: StudentGroup[],
  ): Promise<Record<string, any>[]> {
    // Get all students from all groups into a flat array
    const allStudents: Student[] = studentGroups.flatMap(
      (group) => group.students || [],
    );

    // Calculate how many pages we need (25 students per page)
    const studentsPerPage = 30;
    const numberOfPages = Math.ceil(allStudents.length / studentsPerPage);

    // Create an array to hold inputs for each page
    const paginatedInputs: Record<string, any>[] = [];

    // Process each page
    for (let pageIndex = 0; pageIndex < numberOfPages; pageIndex++) {
      const pageInputs: Record<string, any> = {};

      // Calculate the start and end indices for students on this page
      const startIndex = pageIndex * studentsPerPage;
      const endIndex = Math.min(
        startIndex + studentsPerPage,
        allStudents.length,
      );

      // Process students for this page
      for (let i = startIndex; i < endIndex; i++) {
        const student = allStudents[i];
        // The image index resets for each page (1-25)
        const imageIndex = i - startIndex + 1;

        // Set student image - use the regular image, not the round one
        pageInputs[`image${imageIndex}`] = student.imageRound || '';
      }

      // Fill in empty values for unused student image fields on this page
      const studentsOnThisPage = endIndex - startIndex;
      for (let i = studentsOnThisPage + 1; i <= studentsPerPage; i++) {
        pageInputs[`image${i}`] = '';
      }

      // Add this page's inputs to our array
      paginatedInputs.push(pageInputs);
    }

    return paginatedInputs;
  }

  async transformStudentGroupsToEn04Inputs(
    studentGroups: StudentGroup[],
  ): Promise<Record<string, any>[]> {
    // Create an array to hold inputs for each page
    const paginatedInputs: Record<string, any>[] = [];

    // Initialize the first page
    let currentPageInputs: Record<string, any> = {};
    let recordPosition = 1; // Position on current page (1-4)

    // Process each group
    for (const group of studentGroups) {
      // Skip empty groups
      if (!group.students || group.students.length === 0) {
        continue;
      }

      // Process each student in the group
      for (const student of group.students) {
        // If we've filled the current page (4 records), create a new page
        if (recordPosition > 4) {
          // Add the completed page to our results
          paginatedInputs.push(currentPageInputs);
          // Start a new page
          currentPageInputs = {};
          recordPosition = 1;
        }

        // Map both group and student data to the current record position
        currentPageInputs[`groupImage${recordPosition}`] = group.image || '';
        currentPageInputs[`groupName${recordPosition}`] = `กลุ่ม ${group.name}`;
        currentPageInputs[`studentImage${recordPosition}`] =
          student.image || '';
        currentPageInputs[`studentName${recordPosition}`] =
          `${student.prefix}${student.firstName} ${student.lastName}`;
        currentPageInputs[`studentNickname${recordPosition}`] =
          `(น้อง${student.nickName})`;

        // Move to the next record position
        recordPosition++;
      }
    }

    // Add the last page if it contains any records
    if (recordPosition > 1) {
      // Fill in empty values for unused positions
      for (let i = recordPosition; i <= 4; i++) {
        currentPageInputs[`groupImage${i}`] = '';
        currentPageInputs[`groupName${i}`] = '';
        currentPageInputs[`studentImage${i}`] = '';
        currentPageInputs[`studentName${i}`] = '';
        currentPageInputs[`studentNickname${i}`] = '';
      }

      paginatedInputs.push(currentPageInputs);
    }

    return paginatedInputs;
  }
}
