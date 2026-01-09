# PowerShell Deployment Script for Windows
# Arc Username Pay - Deploy to Arc Testnet

Write-Host "🚀 Deploying ArcUsernamePay to Arc Testnet..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env with:" -ForegroundColor Yellow
    Write-Host '  PRIVATE_KEY="0x..."' -ForegroundColor Yellow
    Write-Host '  ARC_TESTNET_RPC_URL="https://rpc.eu-west-2.gateway.fm/v4/arc/testnet/non-archival/rpc"' -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        Set-Item -Path "env:$name" -Value $value
    }
}

# Check if private key is set
if (-not $env:PRIVATE_KEY) {
    Write-Host "❌ PRIVATE_KEY not set in .env" -ForegroundColor Red
    exit 1
}

# Check if RPC URL is set
if (-not $env:ARC_TESTNET_RPC_URL) {
    Write-Host "⚠️  ARC_TESTNET_RPC_URL not set, using default..." -ForegroundColor Yellow
    $env:ARC_TESTNET_RPC_URL = "https://rpc.eu-west-2.gateway.fm/v4/arc/testnet/non-archival/rpc"
}

Write-Host "📝 Using RPC: $env:ARC_TESTNET_RPC_URL" -ForegroundColor Gray

# Compile the contract
Write-Host "🔨 Compiling contract..." -ForegroundColor Cyan
forge build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Compilation successful!" -ForegroundColor Green

# Deploy the contract
Write-Host "🚀 Deploying contract..." -ForegroundColor Cyan
$deployOutput = forge create src/ArcUsernamePay.sol:ArcUsernamePay `
    --rpc-url $env:ARC_TESTNET_RPC_URL `
    --private-key $env:PRIVATE_KEY `
    --broadcast 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host $deployOutput
    exit 1
}

Write-Host $deployOutput

# Extract contract address
$contractAddress = ($deployOutput | Select-String "Deployed to:\s+(\w+)").Matches.Groups[1].Value

if (-not $contractAddress) {
    Write-Host "❌ Could not extract contract address!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host "📍 Contract Address: $contractAddress" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update CONTRACT_ADDRESS in app.js:" -ForegroundColor White
Write-Host "   const CONTRACT_ADDRESS = '$contractAddress';" -ForegroundColor Gray
Write-Host ""
Write-Host "2. View on Arc Testnet Explorer:" -ForegroundColor White
Write-Host "   https://testnet.arcscan.com/address/$contractAddress" -ForegroundColor Blue
Write-Host ""
Write-Host "3. Start the web server:" -ForegroundColor White
Write-Host "   python -m http.server 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Happy building on Arc!" -ForegroundColor Magenta
