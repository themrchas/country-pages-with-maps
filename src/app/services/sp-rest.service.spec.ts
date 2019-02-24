import { TestBed } from '@angular/core/testing';

import { SpRestService } from './sp-rest.service';

describe('SpRestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpRestService = TestBed.get(SpRestService);
    expect(service).toBeTruthy();
  });
});
