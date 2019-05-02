import { TestBed } from '@angular/core/testing';

import { GeospatialService } from './geospatial.service';

describe('GeospatialService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GeospatialService = TestBed.get(GeospatialService);
    expect(service).toBeTruthy();
  });
});
