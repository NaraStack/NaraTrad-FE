import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PortfolioService } from 'app/features/portfolio/services/portfolio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ToastComponent } from 'app/shared/components/toast/toast.component';
import { ToastService } from 'app/core/services/toast.service';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-update-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastComponent,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: '/update-stock.component.html',
  styleUrls: ['./update-stock.component.scss'],
})
export class UpdateStockComponent implements OnInit, OnDestroy {
  selectedStock: Stock | null = null;
  stockPrice: number | null = null;
  quantity: number = 0;
  totalPrice: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private portofolioService: PortfolioService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<UpdateStockComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stock: Stock } // stock yang dikirim dari tabel
  ) {}

  ngOnInit(): void {
    console.log(this.data.stock);
    if (this.data.stock) {
      this.selectedStock = this.data.stock;
      this.stockPrice = this.data.stock.price;
      this.quantity = null as any;
      this.calculateTotalPrice();
      console.log(this.data.stock);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateTotalPrice(): void {
    if (this.stockPrice !== null && this.quantity !== null) {
      this.totalPrice = this.stockPrice * this.quantity;
    } else {
      this.totalPrice = 0;
    }
  }

  onUpdate(): void {
    if (!this.selectedStock) return;

    if (this.quantity == null || isNaN(this.quantity) || this.quantity <= 0) {
      this.toast.showError('Invalid quantity', 'Quantity must be greater than 0', 3000);
      return;
    }

    this.portofolioService
      .updateStock(this.selectedStock.symbol, this.quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.toast.showSuccess(
            'Stock updated!',
            `${this.quantity} quantity added to ${this.selectedStock?.symbol}`,
            2000
          );

          this.dialogRef.close({
            symbol: this.selectedStock?.symbol,
            quantity: res.newQuantity,
          });
        },
        error: (err) => {
          console.error(err);
          this.toast.showError('Failed to update stock', 'Please try again later.', 4000);
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  getStockValue(stock: Stock): string {
    return stock.symbol;
  }

  getStockDisplay(stock: Stock): string {
    return `${stock.symbol}`;
  }
}
