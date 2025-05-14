import { Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { SvgIconComponent } from 'angular-svg-icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-image-cell-renderer',
  imports: [NzAvatarModule, NzButtonModule],
  templateUrl: './image-cell-renderer.component.html',
  styleUrl: './image-cell-renderer.component.css',
})
export class ImageCellRendererComponent implements ICellRendererAngularComp {
  imageSrc = signal('');
  agInit(params: ICellRendererParams<any, any, any>): void {
    if (params.value) {
      this.imageSrc.set(params.value);
    }
  }
  refresh(params: ICellRendererParams<any, any, any>): boolean {
    console.log('refresh', params);

    if (params.value) {
      this.imageSrc.set(params.value);
    }
    return true;
  }
}
