import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketBottomSheetComponent } from './basket-bottom-sheet.component';

describe('BasketBottomSheetComponent', () => {
  let component: BasketBottomSheetComponent;
  let fixture: ComponentFixture<BasketBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasketBottomSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasketBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
