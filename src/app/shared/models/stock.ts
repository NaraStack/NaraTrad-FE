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

  // Detail per stock
  stockList: Stock[]; // Detail data for each stock
}