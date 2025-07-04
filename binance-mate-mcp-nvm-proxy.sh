#!/bin/bash
# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Source nvm
source ~/.nvm/nvm.sh >/dev/null 2>&1

# Use Node.js version 20
nvm use 20 >/dev/null 2>&1

# Set environment variable to suppress dotenv console output
export DOTENV_CONFIG_SILENT=true

# Execute the MCP server with the full path
exec node "$SCRIPT_DIR/dist/index.js" "$@"
