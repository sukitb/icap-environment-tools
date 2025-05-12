import { ICellRendererParams } from './../../../../../../node_modules/ag-grid-community/dist/types/src/rendering/cellRenderers/iCellRenderer.d';
import { Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SvgIconComponent } from 'angular-svg-icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-image-round-cell-renderer',
  imports: [NzAvatarModule, NzButtonModule, SvgIconComponent],
  template: `
    @if (imageSrc()) {
      <img [src]="imageSrc()" [style.width.px]="100" [style.height.px]="100" />
    } @else {
      <nz-avatar
        nzIcon="user"
        [nzSize]="100"
        nzShape="circle"
        class="group-avatar"
      >
      </nz-avatar>
    }
  `,
  styleUrl: './image-round-cell-renderer.component.css',
})
export class ImageRoundCellRendererComponent
  implements ICellRendererAngularComp
{
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
