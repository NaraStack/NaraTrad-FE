import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Router } from '@angular/router';

import { Stock } from '../../shared/models/stock';
import { PortfolioService } from '../../features/portfolio/services/portfolio';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RouterModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['symbol', 'price', 'change', 'quantity'];
  dataSource = new MatTableDataSource<Stock>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: Stock, filter: string) =>
      data.symbol.toLowerCase().includes(filter);

    this.portfolioService.getStocks().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => alert('Failed to load stocks'),
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  goToAddStock(): void {
    this.router.navigate(['/add-stock']);
  }

  get totalPortfolioValue(): number {
    return this.dataSource.data.reduce(
      (total, stock) => total + stock.price * stock.quantity,
      0
    );
  }

  confirmDelete(stock: Stock): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '360px',
      disableClose: true,
      data: {
        title: 'Delete Stock',
        message: `Are you sure you want to delete ${stock.symbol}? This action cannot be undone.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteStock(stock);
      }
    });
  }

  private deleteStock(stock: Stock): void {
    this.portfolioService.deleteStock(stock.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(
          (s) => s.id !== stock.id
        );
      },
      error: () => alert('Failed to delete stock'),
    });
  }
}
