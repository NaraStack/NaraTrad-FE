import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
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
import { AuthService } from '../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Router } from '@angular/router';

import { Stock, DashboardData } from '../../shared/models/stock';
import { PortfolioService } from '../../features/portfolio/services/portfolio';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
    LoadingSpinnerComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  // Dashboard Summary Data
  totalPortfolioValue = 0;
  totalStocksOwned = 0;
  totalInvestment = 0;
  totalGainLoss = 0;
  roi = 0;
  dailyChange = 0;
  dailyChangePercent = 0;

  // Stock Lists
  topGainers: Stock[] = [];
  topLosers: Stock[] = [];
  largestHoldings: Stock[] = [];

  // Loading states
  isLoading = true;
  chartLoading = false;
  private destroy$ = new Subject<void>();

  // Chart
  @ViewChild('performanceChart') performanceChartRef!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  userName = 'User';

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  this.loadDashboard();

  this.authService.currentUser$.subscribe(user => {
    this.userName = user?.fullName ?? 'User';
  });
}


  ngAfterViewInit(): void {
    // Chart will be initialized after data is loaded
  }

  /* ===================== DATA ===================== */

  private loadDashboard(): void {
    this.isLoading = true;
    this.portfolioService.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardData) => {
          // Set summary data
          this.totalPortfolioValue = data.totalPortfolioValue || 0;
          this.totalStocksOwned = data.totalStocksOwned || 0;
          this.totalInvestment = data.totalInvestment || 0;
          this.totalGainLoss = data.totalGainLoss || 0;
          this.roi = data.roi || 0;
          this.dailyChange = data.dailyChange || 0;
          this.dailyChangePercent = data.dailyChangePercent || 0;

          // Process stock lists
          this.processStockLists(data.stockList || []);

          // Initialize chart
          this.cd.detectChanges();
          this.loadPerformanceChart();

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load dashboard data', err);
          this.isLoading = false;
        },
      });
  }

  private processStockLists(stocks: Stock[]): void {
    // Top Gainers - sorted by change % (descending)
    this.topGainers = [...stocks]
      .filter(s => s.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 3);

    // Top Losers - sorted by change % (ascending)
    this.topLosers = [...stocks]
      .filter(s => s.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 3);

    // Largest Holdings - sorted by total value (descending)
    this.largestHoldings = [...stocks]
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 3);
  }

  private loadPerformanceChart(): void {
    this.chartLoading = true;
    this.portfolioService.getPerformanceChart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.initializeChart(data.labels, data.values);
          this.chartLoading = false;
        },
        error: (err) => {
          console.error('Failed to load chart data', err);
          this.chartLoading = false;
        }
      });
  }

  private initializeChart(labels: string[], dataPoints: number[]): void {
    if (!this.performanceChartRef) return;

    const ctx = this.performanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(45, 106, 79, 0.3)');
    gradient.addColorStop(1, 'rgba(45, 106, 79, 0.01)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Portfolio Value ($)',
          data: dataPoints,
          borderColor: '#2d6a4f',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2d6a4f',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#000851',
            padding: 12,
            titleFont: {
              family: 'Outfit',
              size: 14,
              weight: 600
            },
            bodyFont: {
              family: 'Outfit',
              size: 13
            },
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return value !== null ? '$' + value.toLocaleString('en-US', {minimumFractionDigits: 2}) : '$0.00';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              font: {
                family: 'Outfit',
                size: 12
              },
              callback: function(value) {
                return '$' + (value as number).toLocaleString();
              }
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                family: 'Outfit',
                size: 12
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  goToAddStock(): void {
    this.router.navigate(['/add-stock']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}