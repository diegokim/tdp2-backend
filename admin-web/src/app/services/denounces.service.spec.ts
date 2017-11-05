import { TestBed, inject } from '@angular/core/testing';

import { DenouncesService } from './denounces.service';

describe('DenouncesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DenouncesService]
    });
  });

  it('should be created', inject([DenouncesService], (service: DenouncesService) => {
    expect(service).toBeTruthy();
  }));
});
