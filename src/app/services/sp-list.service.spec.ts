import { TestBed } from '@angular/core/testing';

import { SpListService } from './sp-list.service';

describe('SpListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpListService = TestBed.get(SpListService);
    expect(service).toBeTruthy();
  });
});
