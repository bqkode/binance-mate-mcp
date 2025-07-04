#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { config as dotenvConfig } from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const requireFunc = createRequire(import.meta.url);
const { MainClient } = requireFunc('binance');

// Suppress console output temporarily while loading dotenv
const originalLog = console.log;
const originalError = console.error;
console.log = () => {};
console.error = () => {};

// Configure dotenv to load from the project root directory
const envPath = join(__dirname, '..', '.env');
dotenvConfig({ path: envPath });

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

const SearchCryptoNewsSchema = z.object({
  query: z.string().describe('Search query for cryptocurrency news (e.g., "Bitcoin price prediction" or "Ethereum market analysis")'),
  limit: z.number().optional().default(5).describe('Number of news articles to return (default: 5)'),
});

const AnalyzeMarketSentimentSchema = z.object({
  symbols: z.array(z.string()).describe('Array of cryptocurrency symbols to analyze sentiment for (e.g., ["BTC", "ETH"])'),
});

const QuickPortfolioActionsSchema = z.object({
  risk_tolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional().default('moderate').describe('Investment risk tolerance level'),
  market_outlook: z.enum(['bullish', 'neutral', 'bearish']).optional().default('neutral').describe('Current market outlook expectation'),
});

// Web research functions
async function searchCryptoNews(query: string, limit: number = 5) {
  try {
    // Using DuckDuckGo Instant Answer API for news search
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + ' cryptocurrency news')}&format=json&no_html=1&skip_disambig=1`;
    const response = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const results = [];
    if (response.data && response.data.RelatedTopics) {
      for (let i = 0; i < Math.min(limit, response.data.RelatedTopics.length); i++) {
        const topic = response.data.RelatedTopics[i];
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
            url: topic.FirstURL,
            snippet: topic.Text,
            source: 'DuckDuckGo'
          });
        }
      }
    }
    
    // Fallback: Add some general crypto news if no results
    if (results.length === 0) {
      results.push({
        title: `Search for "${query}" - No specific results found`,
        url: 'https://coindesk.com',
        snippet: 'Consider checking major crypto news sources for latest updates on your query.',
        source: 'Fallback'
      });
    }
    
    return results;
  } catch (error) {
    return [{
      title: 'News Search Error',
      url: '',
      snippet: `Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'Error'
    }];
  }
}

async function analyzeMarketSentiment(symbols: string[]) {
  try {
    const sentimentData = [];
    
    for (const symbol of symbols) {
      // Simulate sentiment analysis based on recent price action
      // In a real implementation, this would use external sentiment APIs
      try {
        const priceData = await binance.getSymbolPriceTicker({ symbol: `${symbol}USDT` });
        const klines = await binance.getKlines({ symbol: `${symbol}USDT`, interval: '1d', limit: 7 });
        
        // Calculate simple sentiment based on recent price movements
        const recentPrices = klines.map((k: any) => parseFloat(k[4])); // closing prices
        const priceChange = ((recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]) * 100;
        
        let sentiment = 'neutral';
        let confidence = Math.min(Math.abs(priceChange) * 10, 100);
        
        if (priceChange > 5) sentiment = 'bullish';
        else if (priceChange > 2) sentiment = 'slightly_bullish';
        else if (priceChange < -5) sentiment = 'bearish';
        else if (priceChange < -2) sentiment = 'slightly_bearish';
        
        sentimentData.push({
          symbol,
          sentiment,
          confidence: Math.round(confidence),
          priceChange7d: Math.round(priceChange * 100) / 100,
          currentPrice: parseFloat(priceData.price),
          analysis: `Based on 7-day price movement of ${priceChange.toFixed(2)}%`
        });
      } catch (error) {
        sentimentData.push({
          symbol,
          sentiment: 'unknown',
          confidence: 0,
          priceChange7d: 0,
          currentPrice: 0,
          analysis: `Unable to analyze sentiment: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return sentimentData;
  } catch (error) {
    throw new Error(`Failed to analyze market sentiment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateQuickPortfolioActions(riskTolerance: string = 'moderate', marketOutlook: string = 'neutral') {
  try {
    // Get current holdings and prices
    const account = await binance.getAccountInformation();
    const holdings = account.balances
      .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
      .map((balance: any) => ({
        asset: balance.asset,
        total: parseFloat(balance.free) + parseFloat(balance.locked)
      }))
      .filter((holding: any) => holding.total > 0 && holding.asset !== 'USDT' && holding.asset !== 'BUSD' && holding.asset !== 'USDC');

    if (holdings.length === 0) {
      return [{
        asset: 'No holdings',
        action: 'START',
        reason: 'No cryptocurrency holdings detected - consider starting with BTC or ETH',
        urgency: 'low'
      }];
    }

    // Get prices and calculate recent performance
    const allPrices = await binance.getSymbolPriceTicker();
    const pricesMap: Record<string, string> = {};
    allPrices.forEach((ticker: any) => {
      pricesMap[ticker.symbol] = ticker.price;
    });

    const recommendations = [];
    
    for (const holding of holdings) {
      try {
        const symbol = `${holding.asset}USDT`;
        const currentPrice = parseFloat(pricesMap[symbol] || '0');
        
        if (currentPrice === 0) {
          recommendations.push({
            asset: holding.asset,
            action: 'MONITOR',
            reason: 'Price data unavailable - monitor for trading resumption',
            urgency: 'medium'
          });
          continue;
        }

        // Get 7-day price history for trend analysis
        const klines = await binance.getKlines({ symbol, interval: '1d', limit: 7 });
        const recentPrices = klines.map((k: any) => parseFloat(k[4])); // closing prices
        const priceChange7d = ((recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]) * 100;
        
        // Calculate volatility (simplified)
        const dailyReturns = [];
        for (let i = 1; i < recentPrices.length; i++) {
          dailyReturns.push((recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1]);
        }
        const volatility = Math.sqrt(dailyReturns.reduce((sum, ret) => sum + ret * ret, 0) / dailyReturns.length) * 100;

        // Generate recommendation based on multiple factors
        let action = 'HOLD';
        let reason = 'Stable performance, continue monitoring';
        let urgency = 'low';

        // Major cryptocurrencies analysis
        if (['BTC', 'ETH'].includes(holding.asset)) {
          if (priceChange7d > 10) {
            action = riskTolerance === 'conservative' ? 'TAKE_PROFIT' : 'HOLD';
            reason = 'Strong 7-day gains - consider taking some profits';
            urgency = 'medium';
          } else if (priceChange7d < -15) {
            action = riskTolerance === 'aggressive' ? 'BUY_DIP' : 'HOLD';
            reason = 'Significant dip in blue-chip crypto - potential buying opportunity';
            urgency = 'high';
          } else {
            action = 'HOLD';
            reason = 'Core holding showing stable performance';
          }
        }
        // Altcoins analysis
        else {
          if (priceChange7d > 20) {
            action = 'TAKE_PROFIT';
            reason = 'Altcoin showing explosive gains - secure profits before reversal';
            urgency = 'high';
          } else if (priceChange7d < -25) {
            action = riskTolerance === 'conservative' ? 'CONSIDER_EXIT' : 'HOLD';
            reason = 'Heavy altcoin losses - evaluate fundamentals';
            urgency = 'high';
          } else if (volatility > 8) {
            action = 'REDUCE';
            reason = 'High volatility detected - consider position sizing';
            urgency = 'medium';
          }
        }

        // Market outlook adjustments
        if (marketOutlook === 'bearish' && action === 'HOLD') {
          action = ['BTC', 'ETH'].includes(holding.asset) ? 'HOLD' : 'REDUCE';
          reason += ' (bearish market outlook)';
        } else if (marketOutlook === 'bullish' && priceChange7d > 0) {
          if (action === 'TAKE_PROFIT' && riskTolerance === 'aggressive') {
            action = 'HOLD';
            reason = 'Bullish outlook supports continued holding despite gains';
          }
        }

        recommendations.push({
          asset: holding.asset,
          action,
          reason,
          urgency,
          priceChange7d: Math.round(priceChange7d * 100) / 100,
          currentHolding: Math.round(holding.total * 1000) / 1000
        });

      } catch (error) {
        recommendations.push({
          asset: holding.asset,
          action: 'MONITOR',
          reason: 'Analysis error - manual review recommended',
          urgency: 'medium'
        });
      }
    }

    return recommendations.sort((a, b) => {
      const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 1) - (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 1);
    });

  } catch (error) {
    throw new Error(`Failed to generate portfolio actions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

const server = new Server(
  {
    name: 'binance-mate-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
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
      {
        name: 'search_crypto_news',
        description: 'Search for recent cryptocurrency news and market analysis',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for cryptocurrency news (e.g., "Bitcoin price prediction" or "Ethereum market analysis")',
            },
            limit: {
              type: 'number',
              description: 'Number of news articles to return (default: 5)',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'analyze_market_sentiment',
        description: 'Analyze market sentiment for specified cryptocurrency symbols based on recent price action',
        inputSchema: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of cryptocurrency symbols to analyze sentiment for (e.g., ["BTC", "ETH"])',
            },
          },
          required: ['symbols'],
        },
      },
      {
        name: 'quick_portfolio_actions',
        description: 'Get immediate actionable suggestions for each cryptocurrency in your portfolio',
        inputSchema: {
          type: 'object',
          properties: {
            risk_tolerance: {
              type: 'string',
              enum: ['conservative', 'moderate', 'aggressive'],
              description: 'Investment risk tolerance level (default: moderate)',
              default: 'moderate',
            },
            market_outlook: {
              type: 'string',
              enum: ['bullish', 'neutral', 'bearish'],
              description: 'Current market outlook expectation (default: neutral)',
              default: 'neutral',
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

    if (name === 'search_crypto_news') {
      const { query, limit } = args as z.infer<typeof SearchCryptoNewsSchema>;
      const newsResults = await searchCryptoNews(query, limit || 5);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              query,
              results: newsResults,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'analyze_market_sentiment') {
      const { symbols } = args as z.infer<typeof AnalyzeMarketSentimentSchema>;
      const sentimentData = await analyzeMarketSentiment(symbols);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              analysis: sentimentData,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'quick_portfolio_actions') {
      const { risk_tolerance, market_outlook } = args as z.infer<typeof QuickPortfolioActionsSchema>;
      const actions = await generateQuickPortfolioActions(risk_tolerance || 'moderate', market_outlook || 'neutral');
      
      // Format as concise TL;DR
      const tldrFormat = actions.map(action => {
        const actionEmoji = {
          'HOLD': '🔒',
          'BUY_DIP': '🛒',
          'TAKE_PROFIT': '💰',
          'REDUCE': '📉',
          'CONSIDER_EXIT': '🚪',
          'MONITOR': '👀',
          'START': '🚀'
        }[action.action] || '📊';
        
        const urgencyEmoji = {
          'high': '🔥',
          'medium': '⚠️',
          'low': '💡'
        }[action.urgency] || '💡';
        
        return `${actionEmoji} **${action.asset}**: ${action.action} ${urgencyEmoji}\n${action.reason}`;
      }).join('\n\n');
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              tldr: tldrFormat,
              detailed_actions: actions,
              risk_profile: risk_tolerance || 'moderate',
              market_outlook: market_outlook || 'neutral',
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

// Prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'generate_investment_report',
        description: 'Generate a comprehensive investment analysis report based on current holdings, market prices, and recent news',
        arguments: [
          {
            name: 'include_news',
            description: 'Whether to include recent news analysis in the report',
            required: false,
          },
          {
            name: 'analysis_depth',
            description: 'Depth of analysis: basic, detailed, or comprehensive',
            required: false,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'generate_investment_report') {
    const includeNews = args?.include_news !== 'false';
    const analysisDepth = args?.analysis_depth || 'detailed';
    
    const prompt = `You are an expert cryptocurrency investment analyst. Generate a comprehensive investment report based on the user's current Binance holdings.

STEPS TO FOLLOW:
1. First, get the user's current holdings using the get_holdings tool
2. Get current market prices for all holdings using the get_prices tool
3. ${includeNews ? 'Search for recent news and analysis for the major holdings using search_crypto_news' : 'Skip news analysis as requested'}
4. Analyze market sentiment for major holdings using analyze_market_sentiment
5. Generate a comprehensive report with:
   - Portfolio overview and current value
   - Individual asset analysis
   - Market sentiment assessment
   ${includeNews ? '- Recent news impact analysis' : ''}
   - Risk assessment
   - Strategic recommendations
   - Suggested portfolio adjustments

ANALYSIS DEPTH: ${analysisDepth.toUpperCase()}
${analysisDepth === 'comprehensive' ? '- Include technical analysis indicators\n- Provide detailed risk/reward scenarios\n- Give specific entry/exit recommendations' : ''}
${analysisDepth === 'detailed' ? '- Include moderate technical analysis\n- Provide risk assessment\n- Give general strategic guidance' : ''}
${analysisDepth === 'basic' ? '- Focus on current holdings overview\n- Basic market sentiment\n- High-level recommendations' : ''}

IMPORTANT: 
- Base all analysis on actual data from the tools
- Provide specific, actionable recommendations
- Include risk warnings and disclaimers
- Consider both short-term and long-term perspectives
- Highlight any unusual market conditions or news events

Generate the report now using the available tools.`;

    return {
      description: `Investment analysis report (${analysisDepth} analysis${includeNews ? ' with news' : ''})`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
    };
  }
  
  throw new Error(`Unknown prompt: ${name}`);
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