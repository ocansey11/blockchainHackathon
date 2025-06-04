# IntelliWallet Testing Guide

## Step 1: Load Extension in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right)
4. Click "Load unpacked"
5. Select the `intelliwallet` folder
6. Verify extension appears with IntelliWallet icon

## Step 2: Test Extension Installation

1. Click the IntelliWallet extension icon in Chrome toolbar
2. You should see the wallet creation screen
3. The popup should be 320x480px with create/import options

## Step 3: Create New Wallet

1. Click "Create New Wallet"
2. Copy and save the seed phrase shown (IMPORTANT!)
3. Click "I've Saved It"
4. Verify you see the main wallet screen with:
   - Wallet address (shortened format)
   - Ethereum Sepolia balance (0.00 ETH)
   - BSC Testnet balance (0.00 BNB)
   - Send/Receive/Refresh buttons

## Step 4: Get Testnet Tokens

### Sepolia ETH:
1. Copy your wallet address (click "Receive" button)
2. Go to: https://sepoliafaucet.com/
3. Paste your address and request tokens
4. Wait 1-2 minutes

### BSC Testnet BNB:
1. Go to: https://testnet.binance.org/faucet-smart
2. Paste your address and request tokens
3. Wait 1-2 minutes

## Step 5: Check Balances

1. Click "Refresh" in the wallet
2. Wait for balance updates
3. Verify you see your testnet tokens:
   - Should show ETH balance > 0
   - Should show BNB balance > 0

## Step 6: Test Sending Transaction

1. Click "Send" button
2. Select network (Sepolia or BSC Testnet)
3. Enter recipient address (can use another wallet or faucet address)
4. Enter small amount (like 0.001)
5. Click "Send Transaction"
6. Wait for confirmation
7. Check transaction on block explorer:
   - Sepolia: https://sepolia.etherscan.io
   - BSC Testnet: https://testnet.bscscan.com

## Step 7: Test Web3 Integration

1. Open the test page: `intelliwallet/test-page.html`
2. Click "Check Web3 Provider"
   - Should detect IntelliWallet
   - Should show connected status
3. Click "Request Accounts" 
   - May show empty (normal for this version)
4. Click "Get Network Info"
   - Should show Sepolia chain ID and network

## Step 8: Test Import Wallet

1. Reset extension (remove and reload)
2. Choose "Import Wallet" 
3. Enter your saved seed phrase
4. Verify wallet loads with same address
5. Balances should appear after refresh

## Expected Results

✅ Wallet creates and stores encrypted data
✅ Real blockchain connections work
✅ Balances update from live networks  
✅ Transactions send and confirm on testnets
✅ Web3 provider injects properly
✅ Import/export works with seed phrases

## Troubleshooting

**No balances showing:**
- Check network connectivity
- Verify RPC endpoints are accessible
- Try refreshing multiple times

**Transaction fails:**
- Ensure sufficient balance for gas fees
- Check recipient address is valid
- Verify network selection matches token

**Extension not loading:**
- Check Chrome developer mode is enabled
- Verify all files are in place
- Check browser console for errors

**Web3 not detected:**
- Refresh page after loading extension
- Check content script injection
- Verify no other wallets are interfering

## Block Explorer Links

- **Sepolia ETH**: https://sepolia.etherscan.io/address/YOUR_ADDRESS
- **BSC Testnet**: https://testnet.bscscan.com/address/YOUR_ADDRESS

Replace YOUR_ADDRESS with your wallet address to track transactions!
