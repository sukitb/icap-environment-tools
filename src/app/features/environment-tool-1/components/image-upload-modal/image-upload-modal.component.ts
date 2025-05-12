import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzStepsModule } from 'ng-zorro-antd/steps';

export interface ImageUploadConfig {
  mode: 'student' | 'group'; // Type of image upload - student has 3 steps, group has 2 steps
  aspectRatio?: number; // Override default aspect ratio
  title?: string; // Override step title
}

@Component({
  selector: 'app-image-upload-modal',
  imports: [
    CommonModule,
    NzButtonModule,
    NzUploadModule,
    ImageCropperComponent,
    NzStepsModule,
  ],
  template: `
    <div class="upload-container">
      <!-- Step indicator - Only shown for student mode with multiple steps -->
      @if (config.mode === 'student') {
        <nz-steps
          [nzCurrent]="currentStep"
          nzSize="small"
          class="steps-container"
        >
          <nz-step nzTitle="เลือกรูปภาพ"></nz-step>
          <nz-step nzTitle="ครอปอัตราส่วน 3:4"></nz-step>
          <nz-step nzTitle="ครอปรูปวงกลม"></nz-step>
        </nz-steps>
      }

      <!-- Step 0: File Selection -->
      @if (currentStep === 0) {
        <div class="upload-section">
          <button nz-button nzType="primary" (click)="fileInput.click()">
            เลือกรูปภาพ
          </button>
          <input
            type="file"
            style="display: none"
            accept="image/*"
            (change)="fileChangeEvent($event)"
            #fileInput
          />
          @if (initialImage) {
            <div class="initial-image">
              <p>รูปภาพปัจจุบัน:</p>
              <img
                [src]="initialImage"
                alt="Current image"
                style="max-height: 150px"
              />
            </div>
          }
        </div>
      }

      <!-- Step 1: Primary cropping step (3:4 for student, 1:1 for group) -->
      @if (currentStep === 1) {
        <div class="cropper-container">
          <div class="step-title">
            {{ getPrimaryCropTitle() }}
          </div>
          <div style="max-width: 300px; margin: 0 auto">
            <image-cropper
              [imageChangedEvent]="imageChangedEvent"
              [output]="'base64'"
              [maintainAspectRatio]="true"
              [aspectRatio]="getPrimaryAspectRatio()"
              [resizeToWidth]="320"
              format="png"
              (imageCropped)="primaryCropped($event)"
            ></image-cropper>
          </div>

          <div class="preview-container">
            <div
              class="preview"
              [ngClass]="{ 'square-preview': config.mode === 'group' }"
            >
              <h4>ตัวอย่างรูปภาพ</h4>
              @if (croppedImage) {
                <img [src]="croppedImage" alt="Cropped preview" />
              }
            </div>
          </div>
        </div>
      }

      <!-- Step 2: Circle Cropping - Only for student mode -->
      @if (currentStep === 2 && config.mode === 'student') {
        <div class="cropper-container">
          <div class="step-title">ครอปรูปภาพเป็นวงกลม (จากรูปต้นฉบับ)</div>
          <div style="max-width: 300px; margin: 0 auto">
            <image-cropper
              [imageChangedEvent]="imageChangedEvent"
              [output]="'base64'"
              [maintainAspectRatio]="true"
              [aspectRatio]="1 / 1"
              [roundCropper]="true"
              format="png"
              (imageCropped)="circleCropped($event)"
              [resizeToWidth]="320"
            ></image-cropper>
          </div>
          <div class="preview-container">
            <div class="preview">
              <h4>ตัวอย่างรูปภาพวงกลม</h4>
              @if (roundImage) {
                <img
                  [src]="roundImage"
                  alt="Round preview"
                  class="round-preview"
                />
              }
            </div>
          </div>
        </div>
      }

      <!-- Navigation buttons -->
      <div class="button-container">
        @if (currentStep === 0) {
          <button nz-button nzType="default" (click)="cancel()">ยกเลิก</button>
        }

        @if (currentStep === 1) {
          <button nz-button (click)="prevStep()">ย้อนกลับ</button>

          <!-- For group mode, save directly. For student mode, go to next step -->
          <button
            nz-button
            nzType="primary"
            [disabled]="!croppedImage"
            (click)="config.mode === 'group' ? save() : nextStep()"
          >
            {{ config.mode === 'group' ? 'บันทึก' : 'ต่อไป' }}
          </button>

          <button nz-button nzType="default" (click)="cancel()">ยกเลิก</button>
        }

        @if (currentStep === 2) {
          <button nz-button (click)="prevStep()">ย้อนกลับ</button>
          <button
            nz-button
            nzType="primary"
            [disabled]="!roundImage"
            (click)="save()"
          >
            บันทึก
          </button>
          <button nz-button nzType="default" (click)="cancel()">ยกเลิก</button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .upload-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
      }
      .steps-container {
        width: 100%;
        margin-bottom: 20px;
      }
      .step-title {
        text-align: center;
        font-weight: bold;
        margin-bottom: 15px;
      }
      .upload-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
      }
      .initial-image {
        margin-top: 20px;
        text-align: center;
      }
      .cropper-container {
        width: 100%;
      }
      .preview-container {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }
      .preview {
        text-align: center;
        margin: 0 15px;
      }
      .preview img {
        width: 100px;
        height: 133px;
        object-fit: contain;
      }
      .square-preview img {
        width: 100px;
        height: 100px;
      }
      .round-preview {
        width: 100px !important;
        height: 100px !important;
        border-radius: 50%;
        object-fit: cover !important;
      }
      .button-container {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
      }
    `,
  ],
})
export class ImageUploadModalComponent implements OnInit {
  @Input() initialImage: string = '';
  @Input() config: ImageUploadConfig = { mode: 'student' };

  readonly nzModalData: {
    initialImage: string;
    config: ImageUploadConfig;
  } = inject(NZ_MODAL_DATA);

  // Step tracking
  currentStep: number = 0;

  // Image states
  imageChangedEvent: any = null;
  imageFile: File | null = null;
  croppedImage: string = '';
  roundImage: string = '';

  constructor(
    private modalRef: NzModalRef,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    // Default configuration if not provided
    if (this.nzModalData) {
      this.config = { ...this.nzModalData.config };
    }
  }

  // Get the appropriate aspect ratio based on configuration
  getPrimaryAspectRatio(): number {
    if (this.config.aspectRatio) {
      return this.config.aspectRatio;
    }

    return this.config.mode === 'student' ? 3 / 4 : 1 / 1;
  }

  // Get the appropriate crop title based on configuration
  getPrimaryCropTitle(): string {
    if (this.config.title) {
      return this.config.title;
    }

    return this.config.mode === 'student'
      ? 'ครอปรูปภาพให้ได้อัตราส่วน 3:4'
      : 'ครอปรูปภาพให้ได้อัตราส่วน 1:1';
  }

  // File selection handler - moves to step 1
  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Verify file is an image
      if (!file.type.includes('image/')) {
        this.message.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      this.imageChangedEvent = event;
      this.imageFile = file;
      this.nextStep(); // Move to rectangle cropping step
    }
  }

  // First crop handler (primary aspect ratio)
  primaryCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64 || '';

    // For group images, we don't need a round image
    if (this.config.mode === 'group') {
      this.roundImage = ''; // Clear the round image
    }
  }

  // Second crop handler (circle - only for student mode)
  circleCropped(event: ImageCroppedEvent): void {
    // Use coordinates to create a proper circular image
    if (event.imagePosition) {
      this.createCircularImageFromCoordinates(event);
    } else {
      // Fallback to square crop if coordinates aren't available
      this.roundImage = event.base64 || '';
    }
  }

  private createCircularImageFromCoordinates(event: ImageCroppedEvent): void {
    // Code for circular cropping (unchanged from your original implementation)
    // ...
    const img = new Image();

    img.onload = () => {
      const coords = event.imagePosition;

      // Get the crop area dimensions
      const x1 = coords!.x1!;
      const x2 = coords!.x2!;
      const y1 = coords!.y1!;
      const y2 = coords!.y2!;

      const width = x2 - x1;
      const height = y2 - y1;

      // Find the smallest dimension to make it a circle
      const size = Math.min(width, height);

      // Create canvas for the circular image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to the circular size
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Calculate centering offsets if width and height are different
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        // Draw the cropped portion centered within the circle
        ctx.drawImage(
          img,
          x1 + offsetX,
          y1 + offsetY,
          size,
          size,
          0,
          0,
          size,
          size,
        );

        // Export as base64
        this.roundImage = canvas.toDataURL('image/png');
      }
    };

    // Load the original image using the imageChangedEvent or imageFile
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(this.imageFile);
    } else if (this.imageChangedEvent?.target?.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(this.imageChangedEvent.target.files[0]);
    }
  }

  // Navigation methods
  nextStep(): void {
    // Validate current step before proceeding
    if (this.currentStep === 0 && !this.imageChangedEvent) {
      this.message.warning('กรุณาเลือกรูปภาพก่อน');
      return;
    }

    if (this.currentStep === 1 && !this.croppedImage) {
      this.message.warning('กรุณาครอปรูปภาพก่อน');
      return;
    }

    // For group mode, only go to step 1. For student mode, go to step 2.
    const maxStep = this.config.mode === 'group' ? 1 : 2;
    if (this.currentStep < maxStep) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  // Save final result
  save(): void {
    if (!this.croppedImage) {
      this.message.warning('กรุณาครอปรูปภาพก่อน');
      return;
    }

    // For student mode, require round image too
    if (this.config.mode === 'student' && !this.roundImage) {
      this.message.warning('กรุณาครอปรูปภาพแบบวงกลมก่อน');
      return;
    }

    // For group mode, we only need the primary cropped image
    if (this.config.mode === 'group') {
      this.modalRef.close({
        image: this.croppedImage,
      });
    } else {
      // For student mode, return both images
      this.modalRef.close({
        image: this.croppedImage,
        roundImage: this.roundImage,
      });
    }
  }

  // Cancel and reset
  cancel(): void {
    this.modalRef.close();
  }
}
