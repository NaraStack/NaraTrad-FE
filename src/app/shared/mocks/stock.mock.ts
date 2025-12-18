import { Stock } from '../models/stock';

export const STOCK_MOCK: Stock[] = [
  {
    id: 1,
    symbol: 'AAPL',
    price: 176.5,
    change: 0.68,
    quantity: 1,
  },
  {
    id: 2,
    symbol: 'GOOGL',
    price: 130.75,
    change: 0.21,
    quantity: 40,
  },
  {
    id: 3,
    symbol: 'TSLA',
    price: 412,
    change: -0.9,
    quantity: 10,
  },
  {
    id: 4,
    symbol: 'AMZN',
    price: 3550.46,
    change: 0.12,
    quantity: 5,
  },
];
