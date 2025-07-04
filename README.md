# Binance Mate MCP

A Model Context Protocol (MCP) server that connects AI assistants (like Claude) to your Binance exchange account, enabling intelligent analysis of your cryptocurrency portfolio and market data. This integration allows AI to provide deep research, strategic insights, and actionable recommendations based on your actual holdings and real-time market conditions.

## What You Can Do

- **Portfolio Analysis** - Get AI-powered insights into your current cryptocurrency holdings
- **Market Research** - Leverage AI to perform deep analysis of market trends for your specific assets
- **Strategic Planning** - Receive data-driven suggestions for portfolio optimization and trading strategies
- **Risk Assessment** - Get comprehensive analysis of your portfolio's risk profile and diversification
- **Real-time Monitoring** - Track current prices and market movements for informed decision-making

## Core Features

- **Get Holdings** - Retrieve your current Binance account balances with detailed breakdown
- **Get Prices** - Fetch real-time market prices for specific symbols or all your holdings

## Important Disclaimer

⚠️ **Financial Responsibility Notice**: While this tool enables AI assistants to provide sophisticated market analysis and strategic recommendations, **you are solely responsible for all financial and investment decisions**. The AI's suggestions are for informational purposes only and should not be considered as financial advice. Always conduct your own research and consider consulting with qualified financial advisors before making investment decisions.

## Prerequisites

- Node.js 18 or higher
- Binance account with API access enabled
- Binance API key and secret

## Installation

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

**Important**: The API credentials must be set in the `.env` file before running the server. Do not add them to the MCP configuration files for security reasons.

5. Build the project:
```bash
npm run build
```

## Getting Binance API Keys

1. Log in to your Binance account
2. Go to Account Settings → API Management
3. Create a new API key
4. **Important**: Only enable "Read" permissions for security
5. Save your API key and secret securely

## Configuration for Different Platforms

### Claude Desktop

1. Open Claude Desktop settings
2. Navigate to the MCP servers configuration
3. Add one of the following configurations:

**Option 1: Using the NVM Proxy Script (Recommended if using NVM)**
```json
{
  "mcpServers": {
    "binance-mate": {
      "command": "/bin/bash",
      "args": ["/absolute/path/to/binance-mate-mcp/binance-mate-mcp-nvm-proxy.sh"]
    }
  }
}
```

**Option 2: Direct Node.js Configuration**
```json
{
  "mcpServers": {
    "binance-mate": {
      "command": "node",
      "args": ["/absolute/path/to/binance-mate-mcp/dist/index.js"]
    }
  }
}
```

**Note**:
- If using the proxy script, make sure it's executable: `chmod +x binance-mate-mcp-nvm-proxy.sh`
- API credentials must be configured in the `.env` file in the project directory

### Claude Code

1. Open Claude Code settings (usually in `~/.claude/claude_code_config.json`)
2. Add the server configuration:

```json
{
  "mcpServers": {
    "binance-mate": {
      "command": "node",
      "args": ["/absolute/path/to/binance-mate-mcp/dist/index.js"]
    }
  }
}
```

### Cursor

1. Open Cursor settings
2. Go to Features → AI → Model Context Protocol
3. Add a new MCP server with the following configuration:

```json
{
  "binance-mate": {
    "command": "node",
    "args": ["/absolute/path/to/binance-mate-mcp/dist/index.js"]
  }
}
```

### Windsurf

1. Open Windsurf preferences
2. Navigate to Extensions → MCP Servers
3. Click "Add Server" and configure:

```json
{
  "name": "binance-mate",
  "command": "node",
  "args": ["/absolute/path/to/binance-mate-mcp/dist/index.js"]
}
```

## Usage

Once configured, the AI assistant in your chosen platform will have access to two tools:

### `get_holdings`
Fetches your current Binance account balances.

Example prompt: "Show me my current crypto holdings on Binance"

### `get_prices`
Gets current market prices for specified symbols or all your holdings.

Example prompts:
- "What's the current price of Bitcoin and Ethereum?"
- "Show me the current prices of all my holdings"

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
2. **Environment Variables**: Never commit your `.env` file or expose your API credentials
3. **Secure Storage**: Store your API keys securely in the `.env` file only
4. **Configuration Files**: Never add API keys directly to MCP configuration files
5. **Rate Limits**: Be aware of Binance API rate limits to avoid being temporarily banned

## Troubleshooting

### Server not starting
- Ensure Node.js 18+ is installed: `node --version`
- Check that the build completed successfully: `npm run build`
- Verify your API credentials are correctly set in `.env`

### Authentication errors
- Double-check your API key and secret are correct
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