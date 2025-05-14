import { TestBed } from '@angular/core/testing';

import { PdfGenerateService } from './pdf-generate.service';

describe('PdfGenerateService', () => {
  let service: PdfGenerateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfGenerateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
