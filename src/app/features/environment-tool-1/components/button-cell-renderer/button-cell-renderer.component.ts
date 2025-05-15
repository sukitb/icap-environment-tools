import { ICellRendererParams } from './../../../../../../node_modules/ag-grid-community/dist/types/src/rendering/cellRenderers/iCellRenderer.d';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-button-cell-renderer',
  standalone: true,
  imports: [NzButtonComponent, NzIconModule],
  template: `
    <button nz-button nzType="primary" nzDanger (click)="onClick($event)">
      <span nz-icon nzType="delete" nzTheme="outline"></span>
      ลบ
    </button>
  `,
  styleUrl: './button-cell-renderer.component.css',
})
export class ButtonCellRendererComponent implements ICellRendererAngularComp {
  private params: any;

  constructor(private modal: NzModalService) {}

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onClick(event: any) {
    event.stopPropagation();

    this.modal.confirm({
      nzTitle: 'ยืนยันการลบ',
      nzContent: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?',
      nzOkText: 'ลบ',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'ยกเลิก',
      nzOnOk: () => {
        if (this.params.onClick instanceof Function) {
          // Call the onClick method that you passed in the column definition
          this.params.onClick(this.params.node);
        }
      },
    });
  }
}
