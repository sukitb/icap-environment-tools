import { TestBed } from '@angular/core/testing';

import { StudentGroupFileService } from './student-group-file.service';

describe('StudentGroupFileService', () => {
  let service: StudentGroupFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentGroupFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
