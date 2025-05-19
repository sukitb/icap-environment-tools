import {
  PdfTemplateConfig,
  PdfTemplateType,
} from '../models/pdf-template.model';
import { template as env01Template } from '../pdf-template/env-01';
import { template as env02Template } from '../pdf-template/env-02';
import { template as env03Template } from '../pdf-template/env-03';
import env04v2Template from '../pdf-template/env-04v2.json';

// Centralized template configuration
export const PDF_TEMPLATES: Record<PdfTemplateType, PdfTemplateConfig> = {
  [PdfTemplateType.ENV_01]: {
    type: PdfTemplateType.ENV_01,
    template: env01Template,
    displayName: 'รูปกลุ่ม',
    fileName: 'env-01-group',
    studentsPerPage: 0, // Not paginated
  },
  [PdfTemplateType.ENV_02]: {
    type: PdfTemplateType.ENV_02,
    template: env02Template,
    displayName: 'รูปนักเรียนสี่เหลี่ยม',
    fileName: 'env-02-student-rectangle',
    studentsPerPage: 25,
  },
  [PdfTemplateType.ENV_03]: {
    type: PdfTemplateType.ENV_03,
    template: env03Template,
    displayName: 'รูปนักเรียนวงกลม',
    fileName: 'env-03-student-circle',
    studentsPerPage: 30,
  },
  [PdfTemplateType.ENV_04]: {
    type: PdfTemplateType.ENV_04,
    template: env04v2Template,
    displayName: 'รูปนักเรียน + กลุ่ม ขนาดใหญ่',
    fileName: 'env-04-student-group-large',
  },
};
