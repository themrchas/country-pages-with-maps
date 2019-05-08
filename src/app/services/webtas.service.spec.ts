import { TestBed } from '@angular/core/testing';

import { WebtasService } from './webtas.service';

describe('WebtasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebtasService = TestBed.get(WebtasService);
    expect(service).toBeTruthy();
  });
});
