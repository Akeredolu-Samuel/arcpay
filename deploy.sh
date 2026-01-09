#!/bin/bash

# Arc Username Pay - Deployment Script
# This script deploys the ArcUsernamePay contract to Arc Testnet

echo "🚀 Deploying ArcUsernamePay to Arc Testnet..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env with:"
    echo "  PRIVATE_KEY=\"0x...\""
    echo "  ARC_TESTNET_RPC_URL=\"https://rpc.eu-west-2.gateway.fm/v4/arc/testnet/non-archival/rpc\""
    exit 1
fi

# Load environment variables
source .env

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env"
    exit 1
fi

# Check if RPC URL is set
if [ -z "$ARC_TESTNET_RPC_URL" ]; then
    echo "⚠️  ARC_TESTNET_RPC_URL not set, using default..."
    export ARC_TESTNET_RPC_URL="https://rpc.eu-west-2.gateway.fm/v4/arc/testnet/non-archival/rpc"
fi

echo "📝 Using RPC: $ARC_TESTNET_RPC_URL"

# Compile the contract
echo "🔨 Compiling contract..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✅ Compilation successful!"

# Deploy the contract
echo "🚀 Deploying contract..."
DEPLOY_OUTPUT=$(forge create src/ArcUsernamePay.sol:ArcUsernamePay \
    --rpc-url $ARC_TESTNET_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "$DEPLOY_OUTPUT"

# Extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Could not extract contract address!"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo "📍 Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "📋 Next steps:"
echo "1. Update CONTRACT_ADDRESS in app.js:"
echo "   const CONTRACT_ADDRESS = '$CONTRACT_ADDRESS';"
echo ""
echo "2. View on Arc Testnet Explorer:"
echo "   https://testnet.arcscan.com/address/$CONTRACT_ADDRESS"
echo ""
echo "3. Start the web server:"
echo "   python -m http.server 8000"
echo ""
echo "🎉 Happy building on Arc!"
