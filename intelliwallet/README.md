# IntelliWallet - Chrome Extension

A non-custodial crypto wallet Chrome extension supporting Ethereum Sepolia and BSC Testnet.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `intelliwallet` folder
4. The IntelliWallet extension should now appear in your extensions

## Testing with Testnets

### Get Testnet Tokens

**Sepolia ETH:**
- Visit: https://sepoliafaucet.com/
- Enter your wallet address
- Claim free Sepolia ETH

**BSC Testnet BNB:**
- Visit: https://testnet.binance.org/faucet-smart
- Enter your wallet address  
- Claim free BNB

### Features

✅ Create new wallet with seed phrase
✅ Import existing wallet from seed phrase
✅ View balances on Sepolia and BSC Testnet
✅ Send transactions on both networks
✅ Secure encrypted wallet storage
✅ Web3 provider injection for dApps

### Usage

1. Click the IntelliWallet extension icon
2. Create a new wallet or import existing one
3. **IMPORTANT:** Save your seed phrase securely!
4. Get testnet tokens from faucets above
5. Use the wallet to send transactions
6. Test with Web3 dApps

### Network Details

**Ethereum Sepolia:**
- Chain ID: 11155111
- RPC: Infura endpoint
- Explorer: https://sepolia.etherscan.io

**BSC Testnet:**
- Chain ID: 97
- RPC: Binance endpoint
- Explorer: https://testnet.bscscan.com

### Security Notes

- This is for TESTNET use only
- Never use real funds
- Always backup your seed phrase
- Encrypted storage using ethers.js
