import { Component } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ImageUploadModalComponent } from '../image-upload-modal/image-upload-modal.component';

@Component({
  selector: 'app-student-image-cell-editor',
  imports: [],
  template: ` <div></div> `,
  providers: [NzModalService],
  styleUrl: './student-image-cell-editor.component.css',
})
export class StudentImageCellEditorComponent implements ICellEditorAngularComp {
  private params!: ICellEditorParams;
  private originalValue: string = '';
  private newImage: string = '';
  private newRoundImage: string = '';

  constructor(private modalService: NzModalService) {}

  agInit(params: ICellEditorParams): void {
    this.params = params;
    this.originalValue = params.value;
    this.openImageUploadModal();
  }

  // This is called by AG Grid to get the value for the current cell
  getValue(): any {
    // Return the new image or the original value if no new image was selected
    return this.newImage || this.originalValue;
  }

  isPopup(): boolean {
    return true;
  }

  openImageUploadModal(): void {
    const modal = this.modalService.create({
      nzTitle: 'อัพโหลดและครอปรูปภาพ',
      nzContent: ImageUploadModalComponent,
      nzWidth: 700,
      nzFooter: null,
      nzData: {
        initialImage: this.originalValue,
        config: {
          mode: 'student',
          title: 'อัพโหลดและครอปรูปภาพ',
        },
      },
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        // First, directly update the data model
        const rowNode = this.params.node;

        // Store the new image value for the current cell (will be returned by getValue)
        this.newImage = result.image;

        // Directly set the round image value in the data model
        rowNode.data.imageRound = result.roundImage;

        // Explicitly refresh the round image cell
        this.params.api.refreshCells({
          rowNodes: [rowNode],
          columns: ['imageRound'],
          force: true,
        });

        // Complete the edit for the current cell
        this.params.api.stopEditing();
      } else {
        this.params.api.stopEditing(true);
      }
    });
  }
}
