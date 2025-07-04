#!/bin/bash
# NVM proxy script for binance-mate-mcp
# This ensures proper Node.js version when using npx

# Source nvm
source ~/.nvm/nvm.sh >/dev/null 2>&1

# Use Node.js version 20 (or latest LTS)
nvm use 20 >/dev/null 2>&1

# Set environment variable to suppress dotenv console output
export DOTENV_CONFIG_SILENT=true

# Execute the MCP server using npx (downloads latest version automatically)
exec npx binance-mate-mcp "$@"
