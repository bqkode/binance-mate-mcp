import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { jest } from '@jest/globals';

// Mock the binance module
jest.mock('binance');

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Set up environment variables for tests
process.env.BINANCE_API_KEY = 'test_api_key';
process.env.BINANCE_API_SECRET = 'test_api_secret';

describe('MCP Binance Server', () => {
  let client: Client;
  let server: Server;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  interface ToolsListResponse {
    tools: Array<{
      name: string;
      description: string;
      inputSchema: any;
    }>;
  }

  interface ToolCallResponse {
    content: Array<{
      type: string;
      text: string;
    }>;
  }

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create linked transport pair
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    
    // Import the server setup after mocks are in place
    const serverModule = await import('../index.js');
    
    // Create client
    client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Connect client
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
  });

  describe('tools/list', () => {
    it('should return available tools', async () => {
      const response = await client.request(
        {
          method: 'tools/list',
        },
        ListToolsRequestSchema
      ) as ToolsListResponse;

      expect(response.tools).toHaveLength(2);
      expect(response.tools[0]).toMatchObject({
        name: 'get_holdings',
        description: 'Get your current Binance holdings (balances)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      });
      expect(response.tools[1]).toMatchObject({
        name: 'get_prices',
        description: 'Get current prices for specified symbols or all holdings',
        inputSchema: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of symbols to get prices for. If not provided, will get prices for all holdings',
            },
          },
        },
      });
    });
  });

  describe('get_holdings tool', () => {
    it('should return current holdings', async () => {
      const response = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'get_holdings',
            arguments: {},
          },
        },
        CallToolRequestSchema
      ) as ToolCallResponse;

      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toHaveProperty('type', 'text');
      
      const result = JSON.parse((response.content[0] as any).text);
      expect(result).toHaveProperty('balances');
      expect(result).toHaveProperty('timestamp');
      expect(result.balances).toHaveLength(2); // Only BTC and ETH have non-zero balances
      
      expect(result.balances[0]).toMatchObject({
        asset: 'BTC',
        free: '0.5',
        locked: '0.1',
        total: '0.6',
      });
      
      expect(result.balances[1]).toMatchObject({
        asset: 'ETH',
        free: '10.0',
        locked: '0.0',
        total: '10',
      });
    });
  });

  describe('get_prices tool', () => {
    it('should return prices for specified symbols', async () => {
      const response = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'get_prices',
            arguments: {
              symbols: ['BTCUSDT', 'ETHUSDT'],
            },
          },
        },
        CallToolRequestSchema
      ) as ToolCallResponse;

      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toHaveProperty('type', 'text');
      
      const result = JSON.parse((response.content[0] as any).text);
      expect(result).toHaveProperty('prices');
      expect(result).toHaveProperty('timestamp');
      expect(result.prices).toHaveLength(2);
      
      expect(result.prices[0]).toMatchObject({
        symbol: 'BTCUSDT',
        price: '45000.00',
      });
      
      expect(result.prices[1]).toMatchObject({
        symbol: 'ETHUSDT',
        price: '3000.00',
      });
    });

    it('should return prices for all holdings when no symbols specified', async () => {
      const response = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'get_prices',
            arguments: {},
          },
        },
        CallToolRequestSchema
      ) as ToolCallResponse;

      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toHaveProperty('type', 'text');
      
      const result = JSON.parse((response.content[0] as any).text);
      expect(result).toHaveProperty('prices');
      expect(result.prices).toHaveLength(2); // BTC and ETH
      
      expect(result.prices.find((p: any) => p.symbol === 'BTCUSDT')).toBeDefined();
      expect(result.prices.find((p: any) => p.symbol === 'ETHUSDT')).toBeDefined();
    });

    it('should handle case when no holdings or symbols exist', async () => {
      // Mock empty account
      const binanceMock = require('binance');
      binanceMock.mockAccount.balances = [
        {
          asset: 'BTC',
          free: '0.0',
          locked: '0.0',
        },
      ];

      const response = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'get_prices',
            arguments: {},
          },
        },
        CallToolRequestSchema
      ) as ToolCallResponse;

      const result = JSON.parse((response.content[0] as any).text);
      expect(result.prices).toHaveLength(0);
      expect(result.message).toBe('No holdings found or symbols provided');
    });
  });

  describe('error handling', () => {
    it('should handle unknown tool error', async () => {
      const response = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'unknown_tool',
            arguments: {},
          },
        },
        CallToolRequestSchema
      ) as ToolCallResponse;

      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toHaveProperty('type', 'text');
      expect((response.content[0] as any).text).toContain('Error: Unknown tool: unknown_tool');
    });

    it('should handle Binance API errors', async () => {
      // Mock an API error
      const binanceMock = require('binance');
      const MockBinance = binanceMock.default;
      MockBinance.prototype.account = jest.fn().mockRejectedValue(new Error('API Error: Invalid API key'));

      const response = await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'get_holdings',
            arguments: {},
          },
        },
        CallToolRequestSchema
      ) as ToolCallResponse;

      expect(response.content).toHaveLength(1);
      expect((response.content[0] as any).text).toContain('Error: API Error: Invalid API key');
    });
  });
});