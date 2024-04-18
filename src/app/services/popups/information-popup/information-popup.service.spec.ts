import { TestBed } from '@angular/core/testing';

import { InformationPopupService } from './information-popup.service';

describe('InformationPopupService', () => {
  let service: InformationPopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InformationPopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
