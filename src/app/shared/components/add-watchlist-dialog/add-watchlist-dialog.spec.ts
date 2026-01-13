import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AddWatchlistDialogComponent } from './add-watchlist-dialog';

describe('AddWatchlistDialogComponent', () => {
  let component: AddWatchlistDialogComponent;
  let fixture: ComponentFixture<AddWatchlistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWatchlistDialogComponent, HttpClientTestingModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            portfolioSymbols: new Set<string>(),
            watchlistSymbols: new Set<string>(),
            prefilledSymbol: null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddWatchlistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
