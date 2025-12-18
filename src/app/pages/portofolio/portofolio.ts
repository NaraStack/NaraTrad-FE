import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { Stock } from '../../shared/models/stock';
import { PortfolioService } from '../../features/portfolio/services/portfolio';

import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portofolio',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    RouterLink,
  ],
  templateUrl: './portofolio.html',
  styleUrl: './portofolio.scss',
})
export class Portofolio implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['symbol', 'price', 'change', 'quantity', 'action'];

  dataSource = new MatTableDataSource<Stock>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private portfolioService: PortfolioService, private router: Router) {}

  ngOnInit(): void {
    this.portfolioService.getStocks().subscribe({
      next: (data) => (this.dataSource.data = data),
      error: () => alert('Failed to load stocks'),
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  addStock(stock: Stock): void {
    stock.quantity++;
    this.dataSource.data = [...this.dataSource.data];
  }

  removeStock(stock: Stock): void {
    this.dataSource.data = this.dataSource.data.filter((s) => s.id !== stock.id);
  }
  goToAddStock(): void {
    console.log('Button clicked');
    this.router.navigate(['/add-stock']);
  }
}
