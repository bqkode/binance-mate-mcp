# Binance Mate MCP

A Model Context Protocol (MCP) server that connects AI assistants (like Claude) to your Binance exchange account, enabling intelligent analysis of your cryptocurrency portfolio and market data. This integration allows AI to provide deep research, strategic insights, and actionable recommendations based on your actual holdings and real-time market conditions.

## ✨ What You'll Get

**🤖 AI Assistant becomes your crypto analyst**:
- Ask "What should I do with my portfolio?" → Get instant actionable suggestions
- Type `/generate-investment-report` → Get comprehensive analysis with news and sentiment
- Say "Show my holdings" → See real-time portfolio breakdown

**📊 Intelligent Portfolio Analysis**:
- Real-time price monitoring for all your holdings
- AI-powered market sentiment analysis
- News research integrated with your specific assets
- Risk-aware recommendations based on your profile

**🎯 Instant Actions**:
- Quick TL;DR suggestions: "HOLD BTC, TAKE_PROFIT ETH, REDUCE DOGE"
- Each suggestion includes reasoning: "Strong 7-day gains - secure profits"
- Urgency indicators: 🔥 High, ⚠️ Medium, 💡 Low priority

---

## 🚀 Getting Started in 2 Minutes

1. **Get Binance API key** (read-only): Binance → Account → API Management
2. **Add to Claude Desktop** MCP config with your API keys:
   ```json
   {
     "mcpServers": {
       "binance-mate": {
         "command": "npx",
         "args": ["binance-mate-mcp"],
         "env": {
           "BINANCE_API_KEY": "your_actual_api_key_here",
           "BINANCE_API_SECRET": "your_actual_secret_here"
         }
       }
     }
   }
   ```
3. **Restart Claude Desktop**
4. **Ask Claude**: "What should I do with my crypto portfolio?"

---

## What You Can Do

- **Portfolio Analysis** - Get AI-powered insights into your current cryptocurrency holdings
- **Market Research** - Leverage AI to perform deep analysis of market trends for your specific assets
- **Strategic Planning** - Receive data-driven suggestions for portfolio optimization and trading strategies
- **Risk Assessment** - Get comprehensive analysis of your portfolio's risk profile and diversification
- **Real-time Monitoring** - Track current prices and market movements for informed decision-making

## Core Features

- **Portfolio Analysis** - Retrieve your current Binance account balances with detailed breakdown
- **Real-time Pricing** - Fetch current market prices for specific symbols or all your holdings
- **Market Research** - Search and analyze recent cryptocurrency news and market trends
- **Sentiment Analysis** - Evaluate market sentiment based on price action and technical indicators
- **Investment Reports** - Generate comprehensive AI-powered investment analysis with strategic recommendations
- **Quick Actions** - Get instant TL;DR suggestions for immediate portfolio decisions

## Important Disclaimer

⚠️ **Financial Responsibility Notice**: While this tool enables AI assistants to provide sophisticated market analysis and strategic recommendations, **you are solely responsible for all financial and investment decisions**. The AI's suggestions are for informational purposes only and should not be considered as financial advice. Always conduct your own research and consider consulting with qualified financial advisors before making investment decisions.

## Prerequisites

- Node.js 18 or higher
- Binance account with API access enabled
- Binance API key and secret

## Quick Start

### 🚀 Setup Your Binance API

1. **Get your Binance API key**:
   - Log in to Binance → Account Settings → API Management
   - Create new API key with **Read permissions only**
   - Save your API key and secret

2. **Test the connection** (optional):
   ```bash
   BINANCE_API_KEY=your_key BINANCE_API_SECRET=your_secret npx binance-mate-mcp
   ```

### Advanced: Build from Source

1. Clone this repository:
```bash
git clone https://github.com/bqkode/binance-mate-mcp.git
cd binance-mate-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Binance API credentials:
```
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_API_SECRET=your_binance_api_secret_here
```

5. Build the project:
```bash
npm run build
```

**Important**: Make sure to use **read-only** API keys for security. The MCP configuration file securely stores your credentials for the AI assistant.

## Configuration for AI Applications

### 🎯 Claude Desktop Setup

1. **Open Claude Desktop settings** → MCP servers configuration

2. **Add your API keys directly in the config**:
```json
{
  "mcpServers": {
    "binance-mate": {
      "command": "npx",
      "args": ["binance-mate-mcp"],
      "env": {
        "BINANCE_API_KEY": "your_actual_api_key_here",
        "BINANCE_API_SECRET": "your_actual_secret_here"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

#### Alternative: Build from Source

<details>
<summary>Click for advanced source build setup</summary>

```json
{
  "mcpServers": {
    "binance-mate": {
      "command": "node",
      "args": ["/absolute/path/to/binance-mate-mcp/dist/index.js"],
      "env": {
        "BINANCE_API_KEY": "your_actual_api_key_here",
        "BINANCE_API_SECRET": "your_actual_secret_here"
      }
    }
  }
}
```
</details>

### 🎯 Claude Code Setup

1. **Open Claude Code settings** (`~/.claude/claude_code_config.json`)

2. **Add this configuration**:
```json
{
  "mcpServers": {
    "binance-mate": {
      "command": "npx",
      "args": ["binance-mate-mcp"],
      "env": {
        "BINANCE_API_KEY": "your_actual_api_key_here",
        "BINANCE_API_SECRET": "your_actual_secret_here"
      }
    }
  }
}
```

3. **Restart Claude Code**


## Usage

Once configured, the AI assistant in your chosen platform will have access to multiple tools and advanced prompts:

## Tools

### `get_holdings`
Fetches your current Binance account balances.

Example prompt: "Show me my current crypto holdings on Binance"

### `get_prices`
Gets current market prices for specified symbols or all your holdings.

Example prompts:
- "What's the current price of Bitcoin and Ethereum?"
- "Show me the current prices of all my holdings"

### `search_crypto_news`
Search for recent cryptocurrency news and market analysis.

Example prompts:
- "Search for recent Bitcoin news"
- "Find analysis on Ethereum market trends"

### `analyze_market_sentiment`
Analyze market sentiment for specified cryptocurrency symbols based on recent price action.

Example prompt: "Analyze market sentiment for BTC and ETH"

### `quick_portfolio_actions`
🚀 **Get instant actionable suggestions for your portfolio** - Quick TL;DR recommendations for each cryptocurrency holding.

**Arguments**:
- `risk_tolerance` (optional): 'conservative', 'moderate', or 'aggressive' (default: moderate)
- `market_outlook` (optional): 'bullish', 'neutral', or 'bearish' (default: neutral)

**Example prompts**:
- "Give me quick actions for my portfolio"
- "What should I do with my crypto holdings right now?"
- "Quick portfolio suggestions with conservative risk tolerance"

**Sample Output**:
```
🔒 BTC: HOLD 💡
Core holding showing stable performance

💰 ETH: TAKE_PROFIT ⚠️
Strong 7-day gains - consider taking some profits

📉 DOGE: REDUCE 🔥
High volatility detected - consider position sizing
```

## Advanced Prompts

### `/generate-investment-report`
**The flagship feature** - Generate comprehensive investment analysis reports that combine:
- Your current Binance holdings
- Real-time market prices
- Recent cryptocurrency news and market analysis
- Technical sentiment analysis
- Strategic investment recommendations

**Usage**: Simply type `/generate-investment-report` in your AI assistant

**Arguments**:
- `include_news` (optional): Set to 'false' to skip news analysis (default: true)
- `analysis_depth` (optional): 'basic', 'detailed', or 'comprehensive' (default: detailed)

**Example prompts**:
- `/generate-investment-report` - Full analysis with news
- `/generate-investment-report include_news=false` - Analysis without news
- `/generate-investment-report analysis_depth=comprehensive` - Deep technical analysis

This prompt automatically:
1. Fetches your current holdings
2. Gets real-time prices for all assets
3. Searches for recent news on your major holdings
4. Analyzes market sentiment
5. Generates actionable investment recommendations

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Project Structure
```
binance-mate-mcp/
├── src/
│   ├── index.ts          # Main server implementation
│   └── __tests__/        # Test files
├── dist/                 # Compiled JavaScript files
├── .env.example          # Example environment configuration
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Security Considerations

1. **API Key Permissions**: Only enable "Read" permissions on your Binance API key
2. **Configuration Security**: Your API keys are stored in MCP configuration files - keep these files secure
3. **Read-Only Access**: This tool only reads your portfolio data, never executes trades
4. **Rate Limits**: Be aware of Binance API rate limits to avoid being temporarily banned
5. **Local Storage**: MCP configuration files are stored locally on your machine only

## Troubleshooting

### Server not starting
- Ensure Node.js 18+ is installed: `node --version`
- Verify your API credentials are correctly set in MCP configuration
- Check that npx can download the package: `npx binance-mate-mcp --help`

### Authentication errors
- Double-check your API key and secret are correct in the MCP config
- Ensure your API key has read permissions enabled
- Check if your API key is restricted by IP (add your IP if needed)

### No data returned
- Verify you have holdings in your Binance account
- Check if the Binance API is accessible from your location
- Ensure your account has API access enabled

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Disclaimer

This tool is for informational purposes only. Always verify important financial information directly through official Binance channels. The authors are not responsible for any financial decisions made based on data from this tool.