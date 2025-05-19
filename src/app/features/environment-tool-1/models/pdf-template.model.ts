import { Template } from '@pdfme/common';

// Define template types
export enum PdfTemplateType {
  ENV_01 = 'env-01',
  ENV_02 = 'env-02',
  ENV_03 = 'env-03',
  ENV_04 = 'env-04',
}

// Define template configuration
export interface PdfTemplateConfig {
  type: PdfTemplateType;
  template: Template;
  displayName: string;
  studentsPerPage?: number;
  fileName: string;
}

// Define PDF input types
export interface PdfInputs {
  [key: string]: string;
}
