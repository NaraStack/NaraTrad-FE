import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AddToPortfolioDialogComponent } from './add-to-portfolio-dialog';
import { StockService } from '../../../features/portfolio/services/stocks';
import { ToastService } from '../../../core/services/toast.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('AddToPortfolioDialogComponent', () => {
  let component: AddToPortfolioDialogComponent;
  let fixture: ComponentFixture<AddToPortfolioDialogComponent>;

  const dialogRefMock = { close: jasmine.createSpy('close') };
  const stockServiceMock = {
    stockPrice: jasmine.createSpy('stockPrice').and.returnValue(of(100)),
    createStock: jasmine.createSpy('createStock').and.returnValue(of({})),
  };
  const toastServiceMock = {
    showSuccess: jasmine.createSpy('showSuccess'),
    showError: jasmine.createSpy('showError'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToPortfolioDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { symbol: 'AAPL' } },
        { provide: StockService, useValue: stockServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddToPortfolioDialogComponent);
    component = fixture.componentInstance;

    dialogRefMock.close.calls.reset();
    stockServiceMock.createStock.calls.reset();
    stockServiceMock.stockPrice.calls.reset();
    toastServiceMock.showSuccess.calls.reset();
    toastServiceMock.showError.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch stock price on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(stockServiceMock.stockPrice).toHaveBeenCalledWith('AAPL');
    expect(component.stockPrice).toBe('100');
  }));

  it('should calculate total price correctly', () => {
    component.quantity = '2';
    component.stockPrice = '100';
    component.calculateTotalPrice();

    expect(component.totalPrice).toBe('200');
  });

  it('should submit and close dialog on success', fakeAsync(() => {
    stockServiceMock.createStock.and.returnValue(of({ success: true }));

    fixture.detectChanges();

    component.quantity = '5';

    component.onSubmit();

    tick();

    expect(stockServiceMock.createStock).toHaveBeenCalledWith('AAPL', 5);

    expect(toastServiceMock.showSuccess).toHaveBeenCalledWith(
      'Stock added!',
      'AAPL successfully added to your portfolio.',
      2000
    );

    expect(dialogRefMock.close).toHaveBeenCalledWith({ symbol: 'AAPL', quantity: 5 });

    expect(component.isSubmitting).toBeFalse();
  }));

  it('should show error toast on submit failure', fakeAsync(() => {
    stockServiceMock.createStock.and.returnValue(throwError(() => new Error('failed')));
    fixture.detectChanges();
    component.quantity = '5';

    component.onSubmit();
    tick();

    expect(toastServiceMock.showError).toHaveBeenCalledWith(
      'Failed to add stock',
      'Please try again later.',
      4000
    );
    expect(dialogRefMock.close).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
  }));

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
