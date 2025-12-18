import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { STOCK_MOCK } from '../../shared/mocks/stock.mock';
import { Stock } from '../../shared/models/stock';

@Component({
  selector: 'app-add-stock',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-stock.html',
  styleUrls: ['./add-stock.scss'],
})
export class AddStockComponent implements OnInit, OnDestroy {
  addStockForm!: FormGroup;
  stocks: Stock[] = STOCK_MOCK;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addStockForm = this.fb.group({
      stockId: [null, Validators.required],
      price: [{ value: 0, disabled: true }],
      quantity: [1, [Validators.required, Validators.min(1)]],
      totalPrice: [{ value: 0, disabled: true }],
    });

    // Stock berubah → set price
    this.addStockForm
      .get('stockId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id: number) => {
        const selectedStock = this.stocks.find((s) => s.id === id);
        if (!selectedStock) return;

        this.addStockForm.patchValue({
          price: selectedStock.price,
        });
      });

    // Auto calculate total price
    this.addStockForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const price = this.addStockForm.get('price')?.value ?? 0;
      const quantity = this.addStockForm.get('quantity')?.value ?? 0;

      this.addStockForm.patchValue({ totalPrice: price * quantity }, { emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.addStockForm.invalid) {
      this.addStockForm.markAllAsTouched();
      return;
    }

    const rawValue = this.addStockForm.getRawValue();
    const stock = this.stocks.find((s) => s.id === rawValue.stockId);

    const payload = {
      stockId: rawValue.stockId,
      symbol: stock?.symbol ?? '',
      price: rawValue.price,
      quantity: rawValue.quantity,
      totalPrice: rawValue.totalPrice,
    };

    console.log('SUBMIT PAYLOAD:', payload);
  }

  onCancel(): void {
    this.addStockForm.reset({
      stockId: null,
      price: 0,
      quantity: 1,
      totalPrice: 0,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
