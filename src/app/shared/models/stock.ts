export interface Stock {
  id: number;
  symbol: string;
  quantity: number;

  // Data from Finnhub API
  price: number;
  change: number; // Percent change (dp)
  totalValue: number; // quantity * price

  // New Fields
  previousClose: number; // Previous closing price (pc)
  priceChange: number; // Price difference in USD (d)

  // Purchase Information
  purchasePrice: number; // Purchase price per share
  createdAt: string; // Purchase date

  // Calculated Fields for Dashboard FE
  totalInvestment: number; // purchasePrice * quantity
  gainLoss: number; // (currentPrice - purchasePrice) * quantity
  gainLossPercent: number; // ((currentPrice - purchasePrice) / purchasePrice) * 100
}

export interface DashboardData {
  // Summary for Dashboard
  totalPortfolioValue: number; // Total current value
  totalStocksOwned: number; // Number of different stock types
  totalInvestment: number; // Total invested capital
  totalGainLoss: number; // Total gain/loss in USD
  roi: number; // Return on Investment in percent
  dailyChange: number; // Today's change in USD
  dailyChangePercent: number; // Today's change in percent

  // Detail per stock
  stockList: Stock[]; // Detail data for each stock
}

export interface PerformanceChartDTO {
  labels: string[]; // Date labels for chart (e.g., ["Jan 01", "Jan 02", ...])
  values: number[]; // Portfolio values for each date
}

export interface Watchlist {
  id: number;
  symbol: string;

  // Real-time data from Finnhub API
  price: number; // Current price
  change: number; // Percent change (%)
  priceChange: number; // Dollar change
  volume: number; // Trading volume

  // User's target price (optional)
  targetPrice?: number;

  // Metadata
  createdAt: string;
}

export interface WatchlistRequest {
  symbol: string;
  targetPrice?: number;
}