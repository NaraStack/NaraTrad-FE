import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { StockService } from '../../../features/portfolio/services/stocks';
import { ToastService } from '../../../core/services/toast.service';

interface DialogData {
  symbol: string;
}

@Component({
  selector: 'app-add-to-portfolio-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-to-portfolio-dialog.html',
  styleUrls: ['./add-to-portfolio-dialog.scss'],
})
export class AddToPortfolioDialogComponent implements OnInit, OnDestroy {
  symbol: string;
  quantity: string = '';
  stockPrice: string | null = null;
  totalPrice: string | null = null;
  priceLoading: boolean = false;
  isSubmitting: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<AddToPortfolioDialogComponent>,
    private stockService: StockService,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.symbol = data.symbol;
  }

  ngOnInit(): void {
    // Fetch stock price for the symbol
    this.fetchStockPrice(this.symbol);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchStockPrice(symbol: string): void {
    this.priceLoading = true;
    this.stockService
      .stockPrice(symbol)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (price) => (this.stockPrice = price.toString()),
        error: () => (this.stockPrice = null),
        complete: () => (this.priceLoading = false),
      });
  }

  calculateTotalPrice(): void {
    const qty = Number(this.quantity);
    const price = Number(this.stockPrice);
    if (qty && price) {
      this.totalPrice = (qty * price).toString();
    } else {
      this.totalPrice = null;
    }
  }

  onSubmit(): void {
    if (!this.symbol || !this.quantity) return;

    this.isSubmitting = true;
    this.stockService
      .createStock(this.symbol, Number(this.quantity))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.showSuccess(
            'Stock added!',
            `${this.symbol} successfully added to your portfolio.`,
            2000
          );
          this.dialogRef.close({
            symbol: this.symbol,
            quantity: Number(this.quantity),
          });
        },
        error: (err) => {
          console.error(err);
          this.toast.showError(
            'Failed to add stock',
            'Please try again later.',
            4000
          );
          this.isSubmitting = false;
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}