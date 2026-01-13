import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Portofolio } from './portofolio';

describe('Portofolio', () => {
  let component: Portofolio;
  let fixture: ComponentFixture<Portofolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portofolio, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Portofolio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
