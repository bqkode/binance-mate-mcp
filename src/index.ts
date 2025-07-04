#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);
const { MainClient } = require('binance');

// Suppress console output temporarily while loading dotenv
const originalLog = console.log;
const originalError = console.error;
console.log = () => {};
console.error = () => {};

// Configure dotenv to load from the project root directory
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Restore console methods
console.log = originalLog;
console.error = originalError;

const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error('Please set BINANCE_API_KEY and BINANCE_API_SECRET in your .env file');
  process.exit(1);
}

const binance = new MainClient({
  api_key: apiKey,
  api_secret: apiSecret,
});

const GetHoldingsSchema = z.object({});

const GetPricesSchema = z.object({
  symbols: z.array(z.string()).optional().describe('Array of symbols to get prices for. If not provided, will get prices for all holdings'),
});

const server = new Server(
  {
    name: 'binance-mate-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_holdings',
        description: 'Get your current Binance holdings (balances)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
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
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_holdings') {
      const account = await binance.getAccountInformation();
      const balances = account.balances
        .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
        .map((balance: any) => ({
          asset: balance.asset,
          free: balance.free,
          locked: balance.locked,
          total: (parseFloat(balance.free) + parseFloat(balance.locked)).toString(),
        }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              balances,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_prices') {
      const { symbols } = args as z.infer<typeof GetPricesSchema>;
      let symbolsToFetch: string[] = [];

      if (symbols && symbols.length > 0) {
        symbolsToFetch = symbols;
      } else {
        const account = await binance.getAccountInformation();
        const holdings = account.balances
          .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
          .map((balance: any) => balance.asset)
          .filter((asset: string) => asset !== 'USDT' && asset !== 'BUSD' && asset !== 'USDC');
        
        symbolsToFetch = holdings.map((asset: string) => `${asset}USDT`);
      }

      if (symbolsToFetch.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                prices: [],
                message: 'No holdings found or symbols provided',
              }, null, 2),
            },
          ],
        };
      }

      // Get all price tickers
      const allPrices = await binance.getSymbolPriceTicker();
      
      // Convert array to object for easier lookup
      const pricesMap: Record<string, string> = {};
      allPrices.forEach((ticker: any) => {
        pricesMap[ticker.symbol] = ticker.price;
      });
      
      const relevantPrices = symbolsToFetch
        .map((symbol) => ({
          symbol,
          price: pricesMap[symbol] || 'N/A',
        }))
        .filter((item) => item.price !== 'N/A');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              prices: relevantPrices,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message || 'An error occurred while executing the tool'}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Binance Mate MCP server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});