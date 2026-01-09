// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ArcUsernamePay
 * @dev A contract that allows users to register usernames and send USDC using usernames instead of addresses
 * Perfect for Arc's "Economic OS" vision - making payments social and easy!
 */
contract ArcUsernamePay {
    // USDC contract address on Arc Testnet
    address public constant USDC_ADDRESS = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    
    IERC20 public usdc;
    
    // Mapping from username to wallet address
    mapping(string => address) public usernameToAddress;
    
    // Mapping from address to username (reverse lookup)
    mapping(address => string) public addressToUsername;
    
    // Events
    event UsernameRegistered(string username, address indexed userAddress);
    event PaymentSent(string indexed fromUsername, string indexed toUsername, uint256 amount, string message);
    
    constructor() {
        usdc = IERC20(USDC_ADDRESS);
    }
    
    /**
     * @dev Register a username for the caller's address
     * @param username The username to register (without @)
     */
    function registerUsername(string memory username) external {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 20, "Username too long (max 20 chars)");
        require(usernameToAddress[username] == address(0), "Username already taken");
        require(bytes(addressToUsername[msg.sender]).length == 0, "Address already has a username");
        
        usernameToAddress[username] = msg.sender;
        addressToUsername[msg.sender] = username;
        
        emit UsernameRegistered(username, msg.sender);
    }
    
    /**
     * @dev Send USDC to a user by their username
     * @param toUsername The recipient's username (without @)
     * @param amount The amount of USDC to send (in smallest units, e.g., 1 USDC = 1000000)
     * @param message Optional message to include with payment
     */
    function payByUsername(string memory toUsername, uint256 amount, string memory message) external {
        address recipient = usernameToAddress[toUsername];
        require(recipient != address(0), "Username not found");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer USDC from sender to recipient
        require(
            usdc.transferFrom(msg.sender, recipient, amount),
            "USDC transfer failed"
        );
        
        string memory senderUsername = addressToUsername[msg.sender];
        if (bytes(senderUsername).length == 0) {
            senderUsername = "Anonymous";
        }
        
        emit PaymentSent(senderUsername, toUsername, amount, message);
    }
    
    /**
     * @dev Check if a username is available
     * @param username The username to check
     * @return bool true if available, false if taken
     */
    function isUsernameAvailable(string memory username) external view returns (bool) {
        return usernameToAddress[username] == address(0);
    }
    
    /**
     * @dev Get the address for a username
     * @param username The username to lookup
     * @return address The wallet address, or address(0) if not found
     */
    function getAddress(string memory username) external view returns (address) {
        return usernameToAddress[username];
    }
    
    /**
     * @dev Get the username for an address
     * @param userAddress The address to lookup
     * @return string The username, or empty string if not registered
     */
    function getUsername(address userAddress) external view returns (string memory) {
        return addressToUsername[userAddress];
    }
}
