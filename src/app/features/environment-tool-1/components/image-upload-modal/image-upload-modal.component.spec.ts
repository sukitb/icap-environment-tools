import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploadModalComponent } from './image-upload-modal.component';

describe('ImageUploadModalComponent', () => {
  let component: ImageUploadModalComponent;
  let fixture: ComponentFixture<ImageUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
