import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentPopupComponent } from './tournament-popup.component';

describe('TournamentPopupComponent', () => {
  let component: TournamentPopupComponent;
  let fixture: ComponentFixture<TournamentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TournamentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
