import { TestBed } from '@angular/core/testing';

import { FormHandleService } from './form-handle.service';

describe('FormHandleService', () => {
  let service: FormHandleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormHandleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
