export const mockAccount = {
  balances: [
    {
      asset: 'BTC',
      free: '0.5',
      locked: '0.1',
    },
    {
      asset: 'ETH',
      free: '10.0',
      locked: '0.0',
    },
    {
      asset: 'USDT',
      free: '1000.0',
      locked: '0.0',
    },
    {
      asset: 'BNB',
      free: '0.0',
      locked: '0.0',
    },
  ],
};

export const mockPriceTickers = [
  { symbol: 'BTCUSDT', price: '45000.00' },
  { symbol: 'ETHUSDT', price: '3000.00' },
  { symbol: 'BNBUSDT', price: '300.00' },
  { symbol: 'ADAUSDT', price: '0.50' },
];

export class MainClient {
  constructor(options: any) {
    // Mock constructor
  }

  async getAccountInformation() {
    return mockAccount;
  }

  async getSymbolPriceTicker() {
    return mockPriceTickers;
  }
}

export default { MainClient };