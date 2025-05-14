import { TestBed } from '@angular/core/testing';

import { StudentGroupEnvironmentGenerateService } from './student-group-environment-generate.service';

describe('StudentGroupEnvironmentGenerateService', () => {
  let service: StudentGroupEnvironmentGenerateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentGroupEnvironmentGenerateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
