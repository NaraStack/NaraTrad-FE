export interface PopularStock {
  symbol: string;
  count: number;
}

export interface UserGrowth {
  date: string;
  count: number;
}

export interface AdminDashboardResponse {
  totalUniqueStocks: number;
  popularStocks: PopularStock[];
  avgPortfolioSize: number;
  totalMarketValue: number;
  totalApiCalls: number;
  avgResponseTime: number;

  totalUsers: number;
  activeUsersToday: number;
  newUsersThisWeek: number;

  userGrowthData: UserGrowth[];
}
