import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Portofolio } from './portofolio';

describe('Portofolio', () => {
  let component: Portofolio;
  let fixture: ComponentFixture<Portofolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portofolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Portofolio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
