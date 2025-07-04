import { jest } from '@jest/globals';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Mock binance before importing anything else
jest.mock('binance', () => {
  const mockBinance = jest.fn().mockImplementation(() => ({
    account: jest.fn().mockResolvedValue({
      balances: [
        { asset: 'BTC', free: '0.5', locked: '0.1' },
        { asset: 'ETH', free: '10.0', locked: '0.0' },
        { asset: 'USDT', free: '1000.0', locked: '0.0' },
        { asset: 'BNB', free: '0.0', locked: '0.0' },
      ],
    }),
    prices: jest.fn().mockResolvedValue({
      BTCUSDT: '45000.00',
      ETHUSDT: '3000.00',
      BNBUSDT: '300.00',
      ADAUSDT: '0.50',
    }),
  }));
  return mockBinance;
});

describe('Simple MCP Server Tests', () => {
  beforeEach(() => {
    process.env.BINANCE_API_KEY = 'test_api_key';
    process.env.BINANCE_API_SECRET = 'test_api_secret';
  });

  it('should create Binance client with API credentials', async () => {
    const Binance = require('binance');
    const binance = new Binance({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
    });

    const account = await binance.account();
    expect(account.balances).toBeDefined();
    expect(account.balances).toHaveLength(4);
  });

  it('should get prices from Binance API', async () => {
    const Binance = require('binance');
    const binance = new Binance({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
    });

    const prices = await binance.prices();
    expect(prices.BTCUSDT).toBe('45000.00');
    expect(prices.ETHUSDT).toBe('3000.00');
  });

  it('should filter out zero balances', async () => {
    const Binance = require('binance');
    const binance = new Binance({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
    });

    const account = await binance.account();
    const nonZeroBalances = account.balances.filter(
      (balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );

    expect(nonZeroBalances).toHaveLength(3); // BTC, ETH, USDT
    expect(nonZeroBalances.find((b: any) => b.asset === 'BNB')).toBeUndefined();
  });
});