import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { Router } from '@angular/router';

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
    MatSelectModule, 
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['symbol', 'price', 'change', 'quantity'];
  dataSource = new MatTableDataSource<Stock>();

  totalPortfolioValue = 0;
  totalStocksOwned = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: Stock, filter: string) =>
      data.symbol.toLowerCase().includes(filter);

    this.loadStocks();
    this.loadSummary();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /* ===================== DATA ===================== */

  private loadStocks(): void {
    this.portfolioService.getStocks().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load stocks', err);
      },
    });
  }

  private loadSummary(): void {
    this.portfolioService.getPortfolioSummary().subscribe({
      next: (summary) => {
        this.totalPortfolioValue = summary.totalPortfolioValue;
        this.totalStocksOwned = summary.totalStocksOwned;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load portfolio summary', err);
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  goToAddStock(): void {
    this.router.navigate(['/add-stock']);
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
      error: (err) => {
        console.error('Failed to delete stock', err);
      },
    });
  }
}
