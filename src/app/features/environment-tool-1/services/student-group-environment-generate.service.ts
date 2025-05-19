import { StudentGroup } from '../models/student-group.model';
import { Injectable } from '@angular/core';
import { PdfGenerateService } from '../../../core/services/pdf-generate/pdf-generate.service';
import { Template } from '@pdfme/common';
import { Student } from '../models/student.model';
import { merge } from '@pdfme/manipulator';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PdfInputs, PdfTemplateType } from '../models/pdf-template.model';
import { PDF_TEMPLATES } from '../config/pdf-templates.config';

@Injectable({
  providedIn: 'root',
})
export class StudentGroupEnvironmentGenerateService {
  constructor(
    private pdfGenerateService: PdfGenerateService,
    private message: NzMessageService,
  ) {}

  /**
   * Generate PDF for a specific template type
   */
  async generatePdf(
    templateType: PdfTemplateType,
    studentGroups: StudentGroup[],
  ): Promise<boolean> {
    if (!studentGroups || studentGroups.length === 0) {
      this.message.warning('กรุณาเพิ่มข้อมูลก่อน');
      return false;
    }

    const templateConfig = PDF_TEMPLATES[templateType];

    // Generate PDF based on template type
    switch (templateType) {
      case PdfTemplateType.ENV_01:
        return this.generateSinglePagePdf(templateConfig, studentGroups);
      case PdfTemplateType.ENV_02:
      case PdfTemplateType.ENV_03:
      case PdfTemplateType.ENV_04:
        return this.generateMultiPagePdf(templateConfig, studentGroups);
      default:
        this.message.error(`ไม่พบรูปแบบเอกสาร ${templateType}`);
        return false;
    }
  }

  /**
   * Generate a single-page PDF (no pagination)
   */
  private async generateSinglePagePdf(
    templateConfig: (typeof PDF_TEMPLATES)[PdfTemplateType],
    studentGroups: StudentGroup[],
  ): Promise<boolean> {
    try {
      const inputs = this.transformStudentGroupsToEn01Inputs(studentGroups);
      const fileName = `${templateConfig.fileName}-${new Date().toISOString().split('T')[0]}`;

      const result = await this.pdfGenerateService.generatePdf(
        templateConfig.template,
        [inputs],
        fileName,
      );

      if (result) {
        console.log('PDF generated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error generating ${templateConfig.displayName}:`, error);
      this.message.error(
        `เกิดข้อผิดพลาดในการสร้าง ${templateConfig.displayName}`,
      );
      return false;
    }
  }

  /**
   * Generate a multi-page PDF with merging
   */
  private async generateMultiPagePdf(
    templateConfig: (typeof PDF_TEMPLATES)[PdfTemplateType],
    studentGroups: StudentGroup[],
  ): Promise<boolean> {
    try {
      // Transform data based on template type
      const paginatedInputs = await this.getPaginatedInputsForTemplate(
        templateConfig.type,
        studentGroups,
      );

      if (!paginatedInputs || paginatedInputs.length === 0) {
        this.message.warning('ไม่มีข้อมูลสำหรับสร้างเอกสาร');
        return false;
      }

      const fileName = `${templateConfig.fileName}-${new Date().toISOString().split('T')[0]}`;

      // Generate page blobs
      const pageBlobs = await Promise.all(
        paginatedInputs.map(async (pageInputs, index) => {
          console.log(`Page ${index + 1} Inputs:`, pageInputs);
          return await this.pdfGenerateService.createPdfBlob(
            templateConfig.template,
            [pageInputs],
          );
        }),
      );

      // Merge PDFs
      const pdfArrayBuffers = await Promise.all(
        pageBlobs.map((blob) => blob.arrayBuffer()),
      );

      const mergedPdfArrayBuffer = await merge(pdfArrayBuffers);

      // Create and download the merged PDF
      const mergedPdfBlob = new Blob([mergedPdfArrayBuffer], {
        type: 'application/pdf',
      });

      this.pdfGenerateService.downloadBlob(
        mergedPdfBlob,
        `${templateConfig.displayName}.pdf`,
      );
      console.log('Successfully merged and downloaded PDF');
      return true;
    } catch (error) {
      console.error(`Error generating ${templateConfig.displayName}:`, error);
      this.message.error(
        `เกิดข้อผิดพลาดในการสร้าง ${templateConfig.displayName}`,
      );
      return false;
    }
  }

  /**
   * Get paginated inputs based on template type
   */
  private async getPaginatedInputsForTemplate(
    templateType: PdfTemplateType,
    studentGroups: StudentGroup[],
  ): Promise<PdfInputs[]> {
    switch (templateType) {
      case PdfTemplateType.ENV_02:
        return this.transformStudentGroupsToEn02Inputs(studentGroups);
      case PdfTemplateType.ENV_03:
        return this.transformStudentGroupsToEn03Inputs(studentGroups);
      case PdfTemplateType.ENV_04:
        return this.transformStudentGroupsToEn04Inputs(studentGroups);
      default:
        throw new Error(`Unsupported template type: ${templateType}`);
    }
  }

  /**
   * Transform data for ENV-01 template (group images)
   */
  private transformStudentGroupsToEn01Inputs(
    studentGroups: StudentGroup[],
  ): PdfInputs {
    const result: PdfInputs = {};
    const maxGroups = 5;

    // Process each group up to the maximum limit
    for (let i = 0; i < Math.min(studentGroups.length, maxGroups); i++) {
      const group = studentGroups[i];
      const groupIndex = i + 1; // 1-based index for template fields

      result[`text${groupIndex}`] = `กลุ่ม ${group.name}`;
      result[`image${groupIndex}`] = group.image || '';
    }

    // Fill in empty values for unused template fields
    for (let i = studentGroups.length + 1; i <= maxGroups; i++) {
      result[`text${i}`] = '';
      result[`image${i}`] = '';
    }

    return result;
  }

  /**
   * Transform data for ENV-02 template (rectangle student images)
   */
  async transformStudentGroupsToEn02Inputs(
    studentGroups: StudentGroup[],
  ): Promise<PdfInputs[]> {
    const templateConfig = PDF_TEMPLATES[PdfTemplateType.ENV_02];
    const studentsPerPage = templateConfig.studentsPerPage || 25;

    // Get all students from all groups
    const allStudents: Student[] = studentGroups.flatMap(
      (group) => group.students || [],
    );

    return this.paginateStudentImages(allStudents, studentsPerPage, 'image');
  }

  /**
   * Transform data for ENV-03 template (round student images)
   */
  async transformStudentGroupsToEn03Inputs(
    studentGroups: StudentGroup[],
  ): Promise<PdfInputs[]> {
    const templateConfig = PDF_TEMPLATES[PdfTemplateType.ENV_03];
    const studentsPerPage = templateConfig.studentsPerPage || 30;

    // Get all students from all groups
    const allStudents: Student[] = studentGroups.flatMap(
      (group) => group.students || [],
    );

    return this.paginateStudentImages(
      allStudents,
      studentsPerPage,
      'imageRound',
    );
  }

  /**
   * Helper function to paginate student images
   */
  private paginateStudentImages(
    allStudents: Student[],
    studentsPerPage: number,
    imageProperty: 'image' | 'imageRound',
  ): PdfInputs[] {
    const numberOfPages = Math.ceil(allStudents.length / studentsPerPage);
    const paginatedInputs: PdfInputs[] = [];

    for (let pageIndex = 0; pageIndex < numberOfPages; pageIndex++) {
      const pageInputs: PdfInputs = {};

      // Calculate the start and end indices for students on this page
      const startIndex = pageIndex * studentsPerPage;
      const endIndex = Math.min(
        startIndex + studentsPerPage,
        allStudents.length,
      );

      // Process students for this page
      for (let i = startIndex; i < endIndex; i++) {
        const student = allStudents[i];
        const imageIndex = i - startIndex + 1;
        pageInputs[`image${imageIndex}`] = student[imageProperty] || '';
      }

      // Fill in empty values for unused student image fields on this page
      const studentsOnThisPage = endIndex - startIndex;
      for (let i = studentsOnThisPage + 1; i <= studentsPerPage; i++) {
        pageInputs[`image${i}`] = '';
      }

      paginatedInputs.push(pageInputs);
    }

    return paginatedInputs;
  }

  /**
   * Transform data for ENV-04 template (student + group layout)
   */
  async transformStudentGroupsToEn04Inputs(
    studentGroups: StudentGroup[],
  ): Promise<PdfInputs[]> {
    const paginatedInputs: PdfInputs[] = [];
    let currentPageInputs: PdfInputs = {};
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
          paginatedInputs.push(currentPageInputs);
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
