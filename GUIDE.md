# Step-by-Step Guide: Deploy Arc Username Payment System

## 📚 Complete Tutorial

This guide walks you through deploying and using your username-based payment system on Arc Testnet from start to finish.

---

## Part 1: Setup (5 minutes)

### Step 1: Install Prerequisites

**A. Install MetaMask**
- Visit [https://metamask.io](https://metamask.io)
- Install browser extension
- Create or import wallet
- **Save your seed phrase securely!**

**B. Install Foundry** (for smart contract deployment)

For Windows (PowerShell):
```powershell
# Install Foundry
irm https://github.com/foundry-rs/foundry/releases/latest/download/foundry_nightly_windows_amd64.zip -OutFile foundry.zip
Expand-Archive foundry.zip -DestinationPath $env:USERPROFILE\.foundry\bin
$env:Path += ";$env:USERPROFILE\.foundry\bin"
```

For Mac/Linux:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Step 2: Get Testnet USDC

1. Copy your MetaMask wallet address
2. Visit [https://faucet.circle.com](https://faucet.circle.com)
3. Select **Arc Testnet** from dropdown
4. Paste your address
5. Click "Request Testnet USDC"
6. Wait ~30 seconds for confirmation ✅

You should receive testnet USDC (it will show as your "balance" in MetaMask after adding Arc network).

---

## Part 2: Deploy Smart Contract (10 minutes)

### Step 3: Initialize Foundry Project

```powershell
# Navigate to your project folder
cd C:\Users\HomePC\Desktop\ARC_PAY

# Initialize Foundry (if not already done)
forge init --no-commit --force
```

### Step 4: Setup Environment Variables

Create a `.env` file in the ARC_PAY directory:

```powershell
# Create .env file
@"
PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"
ARC_TESTNET_RPC_URL="https://rpc.eu-west-2.gateway.fm/v4/arc/testnet/non-archival/rpc"
"@ | Out-File -FilePath .env -Encoding ASCII
```

**🔐 Get Your Private Key:**
1. Open MetaMask
2. Click three dots → Account details
3. Click "Show private key"
4. Enter password
5. Copy private key
6. Paste into .env file (replace `0xYOUR_PRIVATE_KEY_HERE`)

**⚠️ WARNING: Never share your private key or commit .env to Git!**

### Step 5: Move Contract File

The contract is already in the project root. Move it to the Foundry src directory:

```powershell
# Copy contract to src folder
Copy-Item ArcUsernamePay.sol -Destination src/ArcUsernamePay.sol
```

### Step 6: Deploy the Contract

**Option A: Using PowerShell Script**
```powershell
# Run deployment script
.\deploy.ps1
```

**Option B: Manual Deployment**
```powershell
# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        Set-Item -Path "env:$name" -Value $value
    }
}

# Deploy contract
forge create src/ArcUsernamePay.sol:ArcUsernamePay `
    --rpc-url $env:ARC_TESTNET_RPC_URL `
    --private-key $env:PRIVATE_KEY `
    --broadcast
```

**📝 Save the Contract Address!**

Look for this line in the output:
```
Deployed to: 0x1234...5678
```

Copy that address!

### Step 7: Update Web App

Open `app.js` and find line 13:
```javascript
const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS_HERE';
```

Replace with your deployed contract address:
```javascript
const CONTRACT_ADDRESS = '0x1234...5678'; // Your actual address
```

Save the file.

---

## Part 3: Run the Web App (2 minutes)

### Step 8: Start Local Server

**Option A: Python**
```powershell
python -m http.server 8000
```

**Option B: Node.js**
```powershell
npx serve
```

**Option C: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html`
- Select "Open with Live Server"

### Step 9: Open in Browser

Visit: `http://localhost:8000`

You should see the Arc Pay interface! 🎉

---

## Part 4: Use the Application (5 minutes)

### Step 10: Connect Wallet

1. Click **"Connect Wallet"** button
2. MetaMask will pop up asking to connect
3. Click **"Connect"**
4. MetaMask will ask to add Arc Testnet
5. Click **"Approve"** then **"Switch network"**

Your wallet is now connected! The button should show your shortened address.

### Step 11: Register Your Username

1. In the "Register Your Username" section
2. Type your desired username (e.g., `alice`)
   - No special characters
   - Max 20 characters
   - No @ symbol needed
3. Click **"Register Username"**
4. MetaMask pops up with transaction
5. Click **"Confirm"**
6. Wait for confirmation (~5 seconds)
7. Success! ✅ You'll see "Your username: @alice"

### Step 12: Send USDC to Someone

To test this, you'll need a second wallet with a registered username. For testing:

**Create Test Recipient:**
1. Open MetaMask
2. Create a new account (click avatar → Create account)
3. Get testnet USDC for new account from faucet
4. Switch to new account in MetaMask
5. Register a different username (e.g., `bob`)
6. Switch back to your original account

**Now Send Payment:**
1. In the "Send USDC" section
2. Enter recipient username (e.g., `bob`)
3. Enter amount (e.g., `5`)
4. Add message (optional, e.g., "Coffee money")
5. Click **"Send Payment"**
6. MetaMask pops up asking to approve USDC
7. Click **"Confirm"** (first time only)
8. MetaMask pops up again with payment transaction
9. Click **"Confirm"**
10. Wait for confirmation
11. Success! 💸 Payment sent!

**Switch to recipient account to verify they received the USDC!**

---

## Part 5: Verify Everything Works

### Step 13: Check on Block Explorer

1. Visit [https://testnet.arcscan.com](https://testnet.arcscan.com)
2. Enter your contract address in search
3. Click on "Events" tab
4. You should see:
   - `UsernameRegistered` events
   - `PaymentSent` events

### Step 14: Test Contract Functions

Using Foundry's `cast` command:

```powershell
# Check if username exists
cast call YOUR_CONTRACT_ADDRESS "getAddress(string)(address)" "alice" --rpc-url $env:ARC_TESTNET_RPC_URL

# Check if username is available
cast call YOUR_CONTRACT_ADDRESS "isUsernameAvailable(string)(bool)" "newusername" --rpc-url $env:ARC_TESTNET_RPC_URL
```

---

## 🎯 You're Done!

You now have a fully functional username-based payment system on Arc Testnet!

### What You Built:
✅ Smart contract that maps usernames to addresses  
✅ Beautiful web interface  
✅ MetaMask integration  
✅ USDC payments by username  

### What Makes This Special for Circle:
- 🌟 Makes USDC payments **social and easy**
- ⚡ Shows Arc's vision as an "Economic OS"
- 🚀 Demonstrates **real utility** for USDC
- 💡 Solves crypto UX problem (no more addresses!)

---

## 🐛 Troubleshooting

**Problem: "Transaction failed" when registering**
- Make sure you have testnet USDC for gas
- Check you're on Arc Testnet in MetaMask
- Username might already be taken

**Problem: "USDC transfer failed"**
- Make sure you have enough USDC balance
- First approve USDC spending
- Recipient username must exist

**Problem: MetaMask not connecting**
- Refresh page
- Try disconnecting and reconnecting
- Clear browser cache

**Problem: Contract deployment fails**
- Check private key in .env is correct
- Make sure you have testnet USDC
- Verify RPC URL is correct

---

## 📚 Next Steps

Want to extend this project?

1. **Add Transaction History** - Show past payments
2. **Payment Requests** - "@alice is requesting $5 for coffee"
3. **Profile Pages** - Add bios, profile pictures
4. **Username Search** - Directory of all users
5. **Multi-Token** - Support other tokens besides USDC
6. **QR Codes** - Generate payment QR codes
7. **Notifications** - Alert when you receive payment

---

## 🙋 Need Help?

- Arc Docs: [https://docs.arc.network](https://docs.arc.network)
- Circle Faucet: [https://faucet.circle.com](https://faucet.circle.com)
- Foundry Docs: [https://book.getfoundry.sh](https://book.getfoundry.sh)

**Happy Building! 🚀**
