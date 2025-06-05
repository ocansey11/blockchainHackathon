// Network configurations
const NETWORKS = {
  sepolia: {
    name: 'Ethereum Sepolia',
    rpc: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    chainId: 11155111,
    symbol: 'ETH',
    explorer: 'https://sepolia.etherscan.io'
  },
  'bsc-testnet': {
    name: 'BSC Testnet',
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    chainId: 97,
    symbol: 'BNB',
    explorer: 'https://testnet.bscscan.com'
  }
};

let wallet = null;
let providers = {};

// Initialize providers
Object.keys(NETWORKS).forEach(key => {
  providers[key] = new ethers.JsonRpcProvider(NETWORKS[key].rpc);
});

// DOM elements
const createWalletScreen = document.getElementById('createWalletScreen');
const walletScreen = document.getElementById('walletScreen');
const createWalletBtn = document.getElementById('createWalletBtn');
const importWalletBtn = document.getElementById('importWalletBtn');
const mnemonicDisplay = document.getElementById('mnemonicDisplay');
const mnemonicText = document.getElementById('mnemonicText');
const confirmMnemonicBtn = document.getElementById('confirmMnemonicBtn');
const importForm = document.getElementById('importForm');
const importMnemonic = document.getElementById('importMnemonic');
const confirmImportBtn = document.getElementById('confirmImportBtn');
const walletAddress = document.getElementById('walletAddress');
const ethBalance = document.getElementById('ethBalance');
const bnbBalance = document.getElementById('bnbBalance');
const sendBtn = document.getElementById('sendBtn');
const receiveBtn = document.getElementById('receiveBtn');
const refreshBtn = document.getElementById('refreshBtn');
const sendForm = document.getElementById('sendForm');
const networkSelect = document.getElementById('networkSelect');
const toAddress = document.getElementById('toAddress');
const amount = document.getElementById('amount');
const confirmSendBtn = document.getElementById('confirmSendBtn');
const cancelSendBtn = document.getElementById('cancelSendBtn');
const status = document.getElementById('status');

// Utility functions
function showStatus(message, type = 'info') {
  status.textContent = message;
  status.className = `status status-${type}`;
  status.classList.remove('hidden');
  setTimeout(() => status.classList.add('hidden'), 5000);
}

function formatAddress(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Wallet management
async function createWallet() {
  try {
    const newWallet = ethers.Wallet.createRandom();
    mnemonicText.textContent = newWallet.mnemonic.phrase;
    mnemonicDisplay.classList.remove('hidden');
    
    // Store encrypted wallet
    const password = 'default_password'; // In production, get from user
    const encryptedWallet = await newWallet.encrypt(password);
    
    await chrome.storage.local.set({
      encryptedWallet: encryptedWallet,
      hasWallet: true
    });
    
    wallet = newWallet;
  } catch (error) {
    showStatus('Error creating wallet: ' + error.message, 'error');
  }
}

async function importWallet() {
  try {
    const mnemonic = importMnemonic.value.trim();
    if (!mnemonic) {
      showStatus('Please enter a valid mnemonic phrase', 'error');
      return;
    }
    
    const importedWallet = ethers.Wallet.fromPhrase(mnemonic);
    
    // Store encrypted wallet
    const password = 'default_password'; // In production, get from user
    const encryptedWallet = await importedWallet.encrypt(password);
    
    await chrome.storage.local.set({
      encryptedWallet: encryptedWallet,
      hasWallet: true
    });
    
    wallet = importedWallet;
    showWallet();
  } catch (error) {
    showStatus('Error importing wallet: ' + error.message, 'error');
  }
}

async function loadWallet() {
  try {
    const result = await chrome.storage.local.get(['encryptedWallet', 'hasWallet']);
    
    if (result.hasWallet && result.encryptedWallet) {
      const password = 'default_password'; // In production, get from user
      wallet = await ethers.Wallet.fromEncryptedJson(result.encryptedWallet, password);
      showWallet();
    } else {
      createWalletScreen.classList.remove('hidden');
      walletScreen.classList.add('hidden');
    }
  } catch (error) {
    showStatus('Error loading wallet: ' + error.message, 'error');
  }
}

function showWallet() {
  createWalletScreen.classList.add('hidden');
  walletScreen.classList.remove('hidden');
  walletAddress.textContent = formatAddress(wallet.address);
  updateBalances();
}

// Balance management
async function getBalance(network) {
  try {
    const provider = providers[network];
    const balance = await provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`Error getting ${network} balance:`, error);
    return '0.00';
  }
}

async function updateBalances() {
  showStatus('Updating balances...', 'info');
  
  try {
    const [ethBal, bnbBal] = await Promise.all([
      getBalance('sepolia'),
      getBalance('bsc-testnet')
    ]);
    
    ethBalance.textContent = `${parseFloat(ethBal).toFixed(4)} ETH`;
    bnbBalance.textContent = `${parseFloat(bnbBal).toFixed(4)} BNB`;
    
    showStatus('Balances updated', 'success');
  } catch (error) {
    showStatus('Error updating balances: ' + error.message, 'error');
  }
}

// Transaction management
async function sendTransaction() {
  const network = networkSelect.value;
  const to = toAddress.value.trim();
  const value = amount.value.trim();
  
  if (!ethers.isAddress(to)) {
    showStatus('Invalid recipient address', 'error');
    return;
  }
  
  if (!value || parseFloat(value) <= 0) {
    showStatus('Invalid amount', 'error');
    return;
  }
  
  try {
    showStatus('Sending transaction...', 'info');
    
    const provider = providers[network];
    const connectedWallet = wallet.connect(provider);
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    
    const tx = {
      to: to,
      value: ethers.parseEther(value),
      gasLimit: 21000n,
      gasPrice: feeData.gasPrice
    };
    
    const transaction = await connectedWallet.sendTransaction(tx);
    
    showStatus(`Transaction sent: ${transaction.hash}`, 'success');
    
    // Wait for confirmation
    showStatus('Waiting for confirmation...', 'info');
    await transaction.wait();
    
    showStatus('Transaction confirmed!', 'success');
    
    // Reset form and update balances
    sendForm.classList.add('hidden');
    toAddress.value = '';
    amount.value = '';
    updateBalances();
    
  } catch (error) {
    showStatus('Transaction failed: ' + error.message, 'error');
  }
}

// Event listeners
createWalletBtn.addEventListener('click', createWallet);

importWalletBtn.addEventListener('click', () => {
  importForm.classList.remove('hidden');
  mnemonicDisplay.classList.add('hidden');
});

confirmMnemonicBtn.addEventListener('click', showWallet);

confirmImportBtn.addEventListener('click', importWallet);

sendBtn.addEventListener('click', () => {
  sendForm.classList.remove('hidden');
});

cancelSendBtn.addEventListener('click', () => {
  sendForm.classList.add('hidden');
});

receiveBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(wallet.address);
  showStatus('Address copied to clipboard', 'success');
});

refreshBtn.addEventListener('click', updateBalances);

confirmSendBtn.addEventListener('click', sendTransaction);

// Initialize
document.addEventListener('DOMContentLoaded', loadWallet);