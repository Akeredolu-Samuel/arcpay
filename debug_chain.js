const { ethers } = require('ethers');

// Config
const RPC_URL = 'https://rpc.testnet.arc.network';
const CONTRACT_ADDRESS = '0x9d12E496e241B8412e0842936E0A0b723b06D5B8';

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    try {
        const gasPrice = await provider.getGasPrice();
        console.log('⛽ Current Gas Price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
        console.log('   Raw:', gasPrice.toString());

        const block = await provider.getBlock('latest');
        console.log('📦 Latest Block:', block.number);
        console.log('   Gas Limit:', block.gasLimit.toString());

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
