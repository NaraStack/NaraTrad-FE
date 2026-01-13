import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AddStock } from './add-stock';

describe('AddStock', () => {
  let component: AddStock;
  let fixture: ComponentFixture<AddStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStock, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AddStock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
