// Arc Testnet Configuration
const ARC_TESTNET_CONFIG = {
    chainId: '0x4C1DA2', // 5042002 in decimal
    chainName: 'Arc Testnet',
    nativeCurrency: {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 18  // MetaMask requires 18 for custom networks
    },
    // Multiple RPC endpoints for fallback
    rpcUrls: [
        'https://rpc.testnet.arc.network',
        'https://rpc.blockdaemon.testnet.arc.network',
        'https://rpc.drpc.testnet.arc.network',
        'https://rpc.quicknode.testnet.arc.network',
    ],
    blockExplorerUrls: ['https://testnet.arcscan.app/']
};

// USDC Contract Address on Arc Testnet
const USDC_ADDRESS = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';

// Your deployed contract address (update after deployment)
const CONTRACT_ADDRESS = '0x9d12E496e241B8412e0842936E0A0b723b06D5B8';

// Contract ABI
const CONTRACT_ABI = [
    "function registerUsername(string memory username) external",
    "function payByUsername(string memory toUsername, uint256 amount, string memory message) external",
    "function isUsernameAvailable(string memory username) external view returns (bool)",
    "function getAddress(string memory username) external view returns (address)",
    "function getUsername(address userAddress) external view returns (string memory)",
    "function usernameToAddress(string memory) external view returns (address)",
    "function addressToUsername(address) external view returns (string memory)",
    "event UsernameRegistered(string username, address indexed userAddress)",
    "event PaymentSent(string indexed fromUsername, string indexed toUsername, uint256 amount, string message)"
];

// USDC ABI (minimal for approve and transfer)
const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

// Gas settings for Arc Testnet (Base fee is ~160 Gwei)
const ARC_GAS_CONFIG = {
    maxFeePerGas: ethers.utils.parseUnits('200', 'gwei'), // Higher than 160 Gwei for stability
    maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
    gasLimit: 600000 // Buffer for logic reverts
};

// Global variables
let provider;
let signer;
let contract;
let usdcContract;
let userAddress;
let originalWalletHTML; // To restore button state

// Initialize the app
window.addEventListener('load', async () => {
    // Store original HTML to restore easily
    originalWalletHTML = document.getElementById('connectWallet').innerHTML;

    // Update contract address in UI
    document.getElementById('contractAddress').textContent = CONTRACT_ADDRESS;

    // Setup event listeners
    document.getElementById('connectWallet').addEventListener('click', handleWalletClick);
    document.getElementById('registerBtn').addEventListener('click', registerUsername);
    document.getElementById('sendBtn').addEventListener('click', sendPayment);

    // Check if wallet is already connected
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            await connectWallet();
        }
    }
});

// Handle click (Connect or Disconnect)
async function handleWalletClick() {
    const btn = document.getElementById('connectWallet');
    if (btn.classList.contains('connected')) {
        disconnectWallet();
    } else {
        await connectWallet();
    }
}

// Connect MetaMask wallet
async function connectWallet() {
    console.log('🔌 Connecting wallet...');

    try {
        if (typeof ethers === 'undefined') {
            alert('⚠️ Ethers.js not loaded. Refreshing...');
            window.location.reload();
            return;
        }

        if (!window.ethereum) {
            alert('❌ No Web3 wallet found.');
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        const network = await provider.getNetwork();
        if (network.chainId !== 5042002) {
            await switchToArcTestnet();
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
        }

        // Initialize contracts
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

        updateWalletUI();
        loadUserUsername().catch(err => console.error('Username load error:', err));

        showStatus('registerStatus', 'success', '✅ Wallet Connected');

    } catch (error) {
        console.error('❌ Connection error:', error);
        showStatus('registerStatus', 'error', `Failed: ${error.message}`);
    }
}

// Disconnect wallet
function disconnectWallet() {
    console.log('🔌 Disconnecting...');
    userAddress = null;
    signer = null;
    contract = null;
    usdcContract = null;

    const walletBtn = document.getElementById('connectWallet');
    walletBtn.classList.remove('connected');
    walletBtn.innerHTML = originalWalletHTML;
    walletBtn.style.background = '';
    walletBtn.style.borderColor = '';

    document.getElementById('yourUsername').textContent = 'Not registered';
    showStatus('registerStatus', 'success', '👋 Disconnected');
}

// Update UI state
function updateWalletUI() {
    const walletBtn = document.getElementById('connectWallet');
    const walletText = document.getElementById('walletText');

    if (!userAddress) return;

    const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    walletBtn.classList.add('connected');
    walletBtn.innerHTML = `<span class="wallet-icon">👛</span> <span id="walletText">${shortAddress}</span>`;

    // Handle Hover for "Disconnect" text
    walletBtn.onmouseenter = () => {
        document.getElementById('walletText').textContent = '❌ Disconnect';
    };
    walletBtn.onmouseleave = () => {
        const textEl = document.getElementById('walletText');
        if (textEl) textEl.textContent = shortAddress;
    };
}

// Register username
async function registerUsername() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username || !signer) {
        showStatus('registerStatus', 'error', 'Wallet not connected or username empty');
        return;
    }

    try {
        showStatus('registerStatus', 'loading', 'Registering... please confirm in wallet');

        // Force Gas Settings to meet Arc 160 Gwei requirement
        const tx = await contract.registerUsername(username, {
            ...ARC_GAS_CONFIG
        });

        const explorerUrl = ARC_TESTNET_CONFIG.blockExplorerUrls[0];
        showStatus('registerStatus', 'loading', `Transaction sent! <a href="${explorerUrl}tx/${tx.hash}" target="_blank">View on ArcScan</a>. Waiting...`);

        await waitForTransaction(tx);
        showStatus('registerStatus', 'success', `✅ Registered @${username}`);
        await loadUserUsername();
    } catch (error) {
        console.error('Registration Error:', error);
        let msg = error.message;
        if (msg.includes("Internal JSON-RPC error")) {
            msg = "Error: Network error or insufficient Gas. Arc requires ~160 Gwei base fee.";
        }
        showStatus('registerStatus', 'error', msg);
    }
}

// Send payment
async function sendPayment() {
    const recipient = document.getElementById('recipientUsername').value.trim();
    const amount = document.getElementById('amountInput').value;
    const message = document.getElementById('messageInput').value.trim() || 'Payment';

    if (!recipient || !amount || parseFloat(amount) <= 0 || !signer) {
        showStatus('sendStatus', 'error', 'Invalid input or wallet not connected');
        return;
    }

    try {
        const amountInSmallestUnit = ethers.utils.parseUnits(amount, 6);

        // Check allowance
        const allowance = await usdcContract.allowance(userAddress, CONTRACT_ADDRESS);
        if (allowance.lt(amountInSmallestUnit)) {
            showStatus('sendStatus', 'loading', 'Step 1/2: Approving USDC...');
            const appTx = await usdcContract.approve(CONTRACT_ADDRESS, ethers.constants.MaxUint256, {
                ...ARC_GAS_CONFIG,
                gasLimit: 100000 // Approval needs less
            });
            await waitForTransaction(appTx);
        }

        showStatus('sendStatus', 'loading', 'Step 2/2: Confirming Payment...');
        const tx = await contract.payByUsername(recipient, amountInSmallestUnit, message, {
            ...ARC_GAS_CONFIG
        });

        const explorerUrl = ARC_TESTNET_CONFIG.blockExplorerUrls[0];
        showStatus('sendStatus', 'loading', `Payment sent! <a href="${explorerUrl}tx/${tx.hash}" target="_blank">View on ArcScan</a>. Waiting...`);

        await waitForTransaction(tx);
        showStatus('sendStatus', 'success', `✅ Sent $${amount} to @${recipient}`);

        document.getElementById('recipientUsername').value = '';
        document.getElementById('amountInput').value = '';
    } catch (error) {
        console.error('Payment Error:', error);
        showStatus('sendStatus', 'error', error.message);
    }
}

// Helper: Wait for tx
async function waitForTransaction(tx) {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Transaction taking too long. Please check explorer.')), 90000));
    try {
        await Promise.race([tx.wait(), timeout]);
    } catch (err) {
        if (err.message.includes('too long')) {
            throw err;
        }
        throw err;
    }
}

// Show status
function showStatus(elementId, type, message) {
    const el = document.getElementById(elementId);
    el.innerHTML = message;
    el.className = `status-message show ${type}`;
    if (type === 'success') setTimeout(() => el.classList.remove('show'), 8000);
}

// Load user's username
async function loadUserUsername() {
    try {
        const username = await contract.getUsername(userAddress);
        if (username) document.getElementById('yourUsername').textContent = `@${username}`;
    } catch (err) {
        console.error('Username error:', err);
    }
}

// Switch to Arc Testnet
async function switchToArcTestnet() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARC_TESTNET_CONFIG.chainId }],
        });
    } catch (err) {
        if (err.code === 4902 || err.message.includes("Unrecognized")) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [ARC_TESTNET_CONFIG],
            });
        }
    }
}

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => window.location.reload());
    window.ethereum.on('chainChanged', () => window.location.reload());
}
