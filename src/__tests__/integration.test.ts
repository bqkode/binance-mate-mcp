import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { jest } from '@jest/globals';

// Mock the binance module
jest.mock('binance');

// Set up environment variables for tests
process.env.BINANCE_API_KEY = 'test_api_key';
process.env.BINANCE_API_SECRET = 'test_api_secret';

describe('MCP Binance Server Integration Tests', () => {
  let client: Client;
  let transport: StdioClientTransport;
  let serverProcess: any;

  beforeEach(async () => {
    // Start the server process
    serverProcess = spawn('tsx', ['src/index.ts'], {
      env: {
        ...process.env,
        BINANCE_API_KEY: 'test_api_key',
        BINANCE_API_SECRET: 'test_api_secret',
      },
    });

    // Create transport connected to the server process
    transport = new StdioClientTransport({
      command: 'tsx',
      args: ['src/index.ts'],
      env: {
        ...process.env,
        BINANCE_API_KEY: 'test_api_key',
        BINANCE_API_SECRET: 'test_api_secret',
      },
    });

    // Create and connect client
    client = new Client(
      {
        name: 'test-integration-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
  }, 15000);

  afterEach(async () => {
    if (client) {
      await client.close();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should handle full workflow: list tools and call them', async () => {
    // List available tools
    const toolsResponse = await client.request(
      {
        method: 'tools/list',
      },
      ListToolsRequestSchema
    );

    expect(toolsResponse.tools).toHaveLength(2);

    // Get holdings
    const holdingsResponse = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'get_holdings',
          arguments: {},
        },
      },
      CallToolRequestSchema
    );

    expect(holdingsResponse.content).toHaveLength(1);
    const holdings = JSON.parse((holdingsResponse.content[0] as any).text);
    expect(holdings).toHaveProperty('balances');
    expect(holdings).toHaveProperty('timestamp');

    // Get prices for specific symbols
    const pricesResponse = await client.request(
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
    );

    expect(pricesResponse.content).toHaveLength(1);
    const prices = JSON.parse((pricesResponse.content[0] as any).text);
    expect(prices).toHaveProperty('prices');
    expect(prices.prices).toHaveLength(2);
  }, 15000);
});