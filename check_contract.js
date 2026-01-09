const { ethers } = require('ethers');

// Config
const RPC_URL = 'https://rpc.testnet.arc.network';
const CONTRACT_ADDRESS = '0x9d12E496e241B8412e0842936E0A0b723b06D5B8';

async function main() {
    console.log(`Checking code at ${CONTRACT_ADDRESS} on ${RPC_URL}...`);

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    try {
        const code = await provider.getCode(CONTRACT_ADDRESS);

        if (code === '0x') {
            console.log('❌ No code found at this address. Contract is NOT deployed on this chain.');
        } else {
            console.log('✅ Code found! Contract is deployed.');
            console.log('Code length:', code.length);
        }
    } catch (error) {
        console.error('Error checking code:', error.message);
    }
}

main();
