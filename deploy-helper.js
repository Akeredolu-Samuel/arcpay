const ethers = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Load contract bytecode and ABI
const contractSource = `
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
}
`;

console.log('Contract ready for deployment. Please use Remix IDE to deploy:');
console.log('1. Visit https://remix.ethereum.org');
console.log('2. Create new file: ArcUsernamePay.sol');
console.log('3. Copy contract from ArcUsernamePay.sol');
console.log('4. Compile with Solidity 0.8.20+');
console.log('5. Deploy to Arc Testnet using MetaMask');
