import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageRoundCellRendererComponent } from './image-round-cell-renderer.component';

describe('ImageRoundCellRendererComponent', () => {
  let component: ImageRoundCellRendererComponent;
  let fixture: ComponentFixture<ImageRoundCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageRoundCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageRoundCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
