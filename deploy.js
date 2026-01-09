const { ethers } = require('ethers');
require('dotenv').config();

// Contract bytecode (compiled)
const BYTECODE = "0x608060405234801561001057600080fd5b5061001d6001600055565b6109ac8061002d6000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80639b6e5fa51161005b5780639b6e5fa5146101225780639e5a0b041461013e578063d41211951461015a578063f2d53a3c1461017657600080fd5b8063083c2d811461008d57806317d7de7c146100a95780633a708255146100c757806341c0e1b5146100e4575b600080fd5b6100a761009b3660046105c8565b60036020526000908152604090205481565b005b6100b1610194565b6040516100be91906106ca565b60405180910390f35b6100a76100d53660046105e1565b6001600160a01b03166000908152600260205260409020805460ff1916905550565b6100a76100f236600461064d565b610226565b61010a610105366004610753565b6103ab565b6040516001600160a01b0390911681526020016100be565b61012a6104ad565b604051901515815260200161";

async function main() {
    console.log('🚀 Deploying ArcUsernamePay to Arc Testnet...\n');

    // Check environment variables
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '0xYOUR_PRIVATE_KEY_HERE') {
        console.error('❌ Error: Please set PRIVATE_KEY in .env file');
        process.exit(1);
    }

    const RPC_URL = process.env.ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network';

    // Connect to Arc Testnet
    console.log('📡 Connecting to Arc Testnet...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log('💼 Deployer address:', wallet.address);

    // Check balance
    const balance = await wallet.getBalance();
    console.log('💰 Balance:', ethers.utils.formatUnits(balance, 6), 'USDC\n');

    if (balance.eq(0)) {
        console.error('❌ Error: No USDC balance. Get testnet USDC from https://faucet.circle.com');
        process.exit(1);
    }

    // Contract ABI and bytecode
    const contractCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArcUsernamePay {
    address public constant USDC_ADDRESS = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    IERC20 public usdc;
    mapping(string => address) public usernameToAddress;
    mapping(address => string) public addressToUsername;
    event UsernameRegistered(string username, address indexed userAddress);
    event PaymentSent(string indexed fromUsername, string indexed toUsername, uint256 amount, string message);
    
    constructor() {
        usdc = IERC20(USDC_ADDRESS);
    }
    
    function registerUsername(string memory username) external {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 20, "Username too long");
        require(usernameToAddress[username] == address(0), "Username already taken");
        require(bytes(addressToUsername[msg.sender]).length == 0, "Address already has username");
        usernameToAddress[username] = msg.sender;
        addressToUsername[msg.sender] = username;
        emit UsernameRegistered(username, msg.sender);
    }
    
    function payByUsername(string memory toUsername, uint256 amount, string memory message) external {
        address recipient = usernameToAddress[toUsername];
        require(recipient != address(0), "Username not found");
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.transferFrom(msg.sender, recipient, amount), "USDC transfer failed");
        string memory senderUsername = addressToUsername[msg.sender];
        if (bytes(senderUsername).length == 0) {
            senderUsername = "Anonymous";
        }
        emit PaymentSent(senderUsername, toUsername, amount, message);
    }
    
    function isUsernameAvailable(string memory username) external view returns (bool) {
        return usernameToAddress[username] == address(0);
    }
    
    function getAddress(string memory username) external view returns (address) {
        return usernameToAddress[username];
    }
    
    function getUsername(address userAddress) external view returns (string memory) {
        return addressToUsername[userAddress];
    }
}`;

    console.log('📝 Contract ready to deploy');
    console.log('\n⚠️  Note: You need to compile the contract first.');
    console.log('📋 Options:');
    console.log('   1. Use Remix IDE (recommended): https://remix.ethereum.org');
    console.log('   2. Install solc compiler\n');
    console.log('🔍 For Remix deployment:');
    console.log('   - Open https://remix.ethereum.org');
    console.log('   - Create ArcUsernamePay.sol');
    console.log('   - Compile with Solidity 0.8.20+');
    console.log('   - Deploy using MetaMask on Arc Testnet');
    console.log('   - Copy contract address to app.js\n');
}

main()
    .then(() => { })
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });
