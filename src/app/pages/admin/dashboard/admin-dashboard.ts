import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AdminDashboardService } from 'app/core/services/admin-dashboard.service';
import { AdminDashboardResponse, PopularStock } from 'app/core/models/admin-dashboard'; // ➕ ADDED
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgChartsModule, MatTableModule, MatTabsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboard implements OnInit {
  constructor(private dashboardService: AdminDashboardService) {}

  stats = {
    totalUsers: 0,
    activeToday: 0,
    newUsersThisWeek: 0,
    totalUniqueStocks: 0,
    avgPortfolioSize: 0,
    totalMarketValue: 0,
    totalApiCalls: 0,
    avgResponseTime: 0,
  };

  popularStocks: PopularStock[] = [];
  displayedColumns: string[] = ['no', 'symbol', 'count'];

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'User Growth',
        data: [],
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    scales: {
      y: {
        min: 1,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
        },
      },
    },
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (res: AdminDashboardResponse) => {
        const {
          totalUsers,
          activeUsersToday,
          newUsersThisWeek,
          userGrowthData,
          totalUniqueStocks,
          popularStocks,
          avgPortfolioSize,
          totalMarketValue,
          totalApiCalls,
          avgResponseTime,
        } = res;

        // stats user
        this.stats = {
          totalUsers,
          activeToday: activeUsersToday,
          newUsersThisWeek,
          totalUniqueStocks,
          avgPortfolioSize,
          totalMarketValue,
          totalApiCalls,
          avgResponseTime,
        };

        // user growth
        this.lineChartData = {
          labels: userGrowthData.map((item) => item.date),
          datasets: [
            {
              label: 'User Growth',
              data: userGrowthData.map((item) => item.count),
              tension: 0.4,
              borderWidth: 2,
            },
          ],
        };

        // poppular stocks
        this.popularStocks = popularStocks;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
      },
    });
  }
}
