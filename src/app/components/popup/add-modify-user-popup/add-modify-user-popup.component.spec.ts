import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddModifyUserPopupComponent } from './add-modify-user-popup.component';

describe('AddModifyUserPopupComponent', () => {
  let component: AddModifyUserPopupComponent;
  let fixture: ComponentFixture<AddModifyUserPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddModifyUserPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddModifyUserPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
