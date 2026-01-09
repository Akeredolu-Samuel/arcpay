# Arc Testnet RPC Fix

If you are having trouble determining the correct RPC / Chain ID for Arc Testnet, here is the working configuration (as of Jan 2026):

## Correct Configuration

| Field | Value |
|Str|---|
| **Network Name** | `Arc Testnet` |
| **New RPC URL** | `https://rpc.testnet.arc.network` |
| **Chain ID** | `5042002` (Hex: `0x4C1DA2`) |
| **Currency Symbol** | `USDC` |
| **Explorer URL** | `https://testnet.arcscan.app` |

## How to Check

1. Open `test.html` in your browser.
2. Click **1. Test Wallet**.
3. It should detect if you are on the wrong network and prompt to add/switch to the correct one above.

## Common Errors

- **Unrecognized chain ID**: This means your wallet doesn't know about Chain ID `5042002` yet. The app will prompt you to add it.
- **Wrong network**: You might be connected to Ethereum Mainnet or Sepolia. Click the prompt to switch.
