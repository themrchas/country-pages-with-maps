import { TestBed, inject } from '@angular/core/testing';

import { SpServicesWrapperService } from './sp-services-wrapper.service';

describe('SpServicesWrapperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpServicesWrapperService]
    });
  });

  it('should be created', inject([SpServicesWrapperService], (service: SpServicesWrapperService) => {
    expect(service).toBeTruthy();
  }));
});
