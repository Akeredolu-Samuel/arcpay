# Arc Username Payment System 💸

> Send USDC on Arc Testnet using just a username - no wallet addresses needed!

## 🌟 What Is This?

Arc Username Pay is a **Venmo-style payment system** for Arc Testnet that lets you send USDC using simple usernames like `@alice` instead of long wallet addresses. It's built for Arc's "Economic OS" vision - making crypto payments social and easy!

## ✨ Features

- 🎯 **Register Your Username** - Claim your unique `@username` on Arc
- 💸 **Send USDC by Username** - Pay anyone with `@theirusername` 
- 🚀 **No Addresses** - No more copy/pasting wallet addresses
- ⚡ **Fast & Easy** - Built on Arc Testnet with USDC as gas
- 🔒 **Secure** - Smart contract ensures usernames are unique

## 📁 Project Structure

```
ARC_PAY/
├── ArcUsernamePay.sol    # Smart contract (username registry + payments)
├── index.html            # Web interface
├── style.css             # Modern, vibrant styling
├── app.js                # ethers.js integration
├── deploy.sh             # Foundry deployment script
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- [MetaMask](https://metamask.io/) browser extension
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for deployment)
- Arc Testnet USDC from [Circle Faucet](https://faucet.circle.com)

### Step 1: Get Testnet USDC

1. Visit [https://faucet.circle.com](https://faucet.circle.com)
2. Select **Arc Testnet**
3. Enter your wallet address
4. Request testnet USDC

### Step 2: Deploy the Smart Contract

```bash
# Initialize Foundry project (if not already done)
forge init --no-commit

# Copy the contract
cp ArcUsernamePay.sol src/

# Create .env file
echo 'PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"' > .env
echo 'ARC_TESTNET_RPC_URL="https://rpc.eu-west-2.gateway.fm/v4/arc/testnet/non-archival/rpc"' >> .env

# Load environment variables
source .env

# Deploy to Arc Testnet
forge create src/ArcUsernamePay.sol:ArcUsernamePay \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Copy the deployed contract address from output
```

### Step 3: Update Contract Address

Open `app.js` and update line 13:
```javascript
const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS_HERE';
```

### Step 4: Run the Web App

```bash
# Simple Python server
python -m http.server 8000

# Or Node.js server
npx serve
```

Visit `http://localhost:8000` in your browser!

## 📖 How to Use

### 1. Connect Your Wallet
- Click "Connect Wallet" button
- Approve MetaMask connection
- Switch to Arc Testnet (automatic prompt)

### 2. Register Your Username
- Enter your desired username (e.g., `alice`)
- Click "Register Username"
- Confirm transaction in MetaMask
- Your username is now registered! 🎉

### 3. Send USDC
- Enter recipient's username (e.g., `bob`)
- Enter amount in USDC
- Add optional message
- Click "Send Payment"
- Approve USDC spending (first time only)
- Confirm payment transaction
- Done! 💸

## 🔧 Technical Details

### Smart Contract

**ArcUsernamePay.sol** provides:
- `registerUsername(username)` - Register your username
- `payByUsername(username, amount, message)` - Send USDC to a username
- `isUsernameAvailable(username)` - Check if username is free
- `getAddress(username)` - Look up wallet address
- `getUsername(address)` - Look up username

### Arc Testnet Configuration

- **Chain ID**: 846316 (0xCE9EC)
- **RPC URL**: https://rpc.eu-west-2.gateway.fm/v4/arc/testnet/non-archival/rpc
- **Explorer**: https://testnet.arcscan.com/
- **Native Gas Token**: USDC
- **USDC Address**: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

### Key Functions

**Registration Flow:**
1. User enters username
2. Contract checks if available
3. Maps username → wallet address
4. Emits `UsernameRegistered` event

**Payment Flow:**
1. User enters recipient username + amount
2. Contract looks up recipient's address
3. User approves USDC spending
4. Contract transfers USDC from sender to recipient
5. Emits `PaymentSent` event

## 🎨 Design Philosophy

- **Modern & Vibrant** - Dark theme with purple/pink gradients
- **Smooth Animations** - Hover effects and micro-interactions
- **Premium Feel** - Glassmorphism and glowing effects
- **Mobile Responsive** - Works on all screen sizes

## 🔐 Security Notes

⚠️ **This is a testnet application for demonstration purposes**

- Never use your real private keys
- Testnet USDC has no real value
- Always audit contracts before mainnet deployment
- Use environment variables for sensitive data

## 🛠️ Development

### Testing Smart Contract

```bash
# Compile
forge build

# Test (create test file first)
forge test

# Check if username is available
cast call $CONTRACT_ADDRESS "isUsernameAvailable(string)(bool)" "alice" \
  --rpc-url $ARC_TESTNET_RPC_URL
```

### Debugging

- Open browser console (F12) for detailed logs
- Check MetaMask for transaction status
- View transactions on [Arc Testnet Explorer](https://testnet.arcscan.com/)

## 📚 Resources

- [Arc Documentation](https://docs.arc.network/)
- [Circle USDC Faucet](https://faucet.circle.com)
- [Foundry Book](https://book.getfoundry.sh/)
- [ethers.js Docs](https://docs.ethers.org/v5/)

## 🎯 Why This Matters for Circle

Arc's mission is to be the **"Economic OS"** - this project demonstrates:

✅ **Social Payments** - Usernames make crypto payments human-friendly  
✅ **USDC Utility** - Shows USDC as both gas token and payment currency  
✅ **Developer Experience** - Easy to build on Arc with existing tools  
✅ **User Experience** - Crypto payments as simple as Venmo  

## 🚀 Next Steps

Potential improvements:
- [ ] Add profile pictures/bios
- [ ] Payment request feature ("@alice is requesting $5")
- [ ] Transaction history view
- [ ] Username search/directory
- [ ] ENS integration
- [ ] Multi-token support (not just USDC)

## 📜 License

MIT License - feel free to use and modify!

## 🙋 Questions?

Built for Arc Testnet | Powered by Circle USDC 💜
