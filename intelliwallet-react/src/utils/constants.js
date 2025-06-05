// Alchemy API Configuration
export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "demo"

// Network configurations with Alchemy RPC endpoints
export const NETWORKS = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpc: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
    color: '#627EEA',
    alchemyNetwork: 'ETH_MAINNET'
  },
  polygon: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpc: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
    color: '#8247E5',
    alchemyNetwork: 'MATIC_MAINNET'
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpc: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
    color: '#28A0F0',
    alchemyNetwork: 'ARB_MAINNET'
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    rpc: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
    color: '#FF0420',
    alchemyNetwork: 'OPT_MAINNET'
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpc: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    symbol: 'ETH',
    explorer: 'https://sepolia.etherscan.io',
    color: '#627EEA',
    alchemyNetwork: 'ETH_SEPOLIA'
  }
}

export const STORAGE_KEYS = {
  ENCRYPTED_WALLET: 'encrypted_wallet',
  HAS_WALLET: 'has_wallet',
  WALLET_ADDRESS: 'wallet_address',
  SELECTED_NETWORK: 'selected_network'
}

export const DEFAULT_PASSWORD = 'default123'