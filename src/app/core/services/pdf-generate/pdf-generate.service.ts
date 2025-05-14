import { Injectable } from '@angular/core';
import {
  BLANK_A4_PDF,
  type GenerateProps,
  type Schema,
  type Template,
} from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { text, image, barcodes, rectangle } from '@pdfme/schemas';
import type { Font } from '@pdfme/common';

@Injectable({
  providedIn: 'root',
})
export class PdfGenerateService {
  constructor() {}

  /**
   * Generates a PDF and triggers download
   */
  public async generatePdf(
    template: any,
    inputs: Record<string, any>[],
    name: string,
  ): Promise<boolean> {
    // Add return type
    try {
      const pdfBlob = await this.createPdfBlob(template, inputs);
      this.downloadBlob(pdfBlob, `${name}.pdf`);
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Consider using a message service or returning the error
      return false;
    }
  }

  /**
   * Creates a PDF Blob from template and inputs
   */
  public async createPdfBlob(
    template: any,
    inputs: Record<string, any>[],
  ): Promise<Blob> {
    // load font from assets
    const fontUrl = 'fonts/Sarabun-Regular.ttf';
    const fontResponse = await fetch(fontUrl);

    if (!fontResponse.ok) {
      throw new Error(`Failed to load font: ${fontResponse.statusText}`);
    }

    const fontArrayBuffer = await fontResponse.arrayBuffer();

    const font: Font = {
      Sarabun: {
        data: fontArrayBuffer,
        fallback: true,
      },
    };
    const pdf = await generate({
      template,
      inputs,
      plugins: {
        text,
        image,
        rectangle,
      },
      options: {
        font,
      },
    });
    return new Blob([pdf], { type: 'application/pdf' });
  }

  /**
   * Downloads a Blob as a file
   */
  public downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
