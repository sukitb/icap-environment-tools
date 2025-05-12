import { ICellRendererParams } from './../../../../../../node_modules/ag-grid-community/dist/types/src/rendering/cellRenderers/iCellRenderer.d';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-button-cell-renderer',
  imports: [NzButtonComponent, NzIconModule],
  template: `
    <button nz-button nzType="default" nzDanger (click)="onClick($event)">
      ลบ
    </button>
  `,
  styleUrl: './button-cell-renderer.component.css',
})
export class ButtonCellRendererComponent implements ICellRendererAngularComp {
  private params: any;

  agInit(params: ICellRendererParams<any, any, any>): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
    return false;
  }

  onClick(event: any) {
    event.stopPropagation();
    if (this.params.onClick instanceof Function) {
      // Call the onClick method that you'll pass in the column definition
      this.params.onClick(this.params.node);
    }
  }
}
