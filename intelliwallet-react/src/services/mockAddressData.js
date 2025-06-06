// Mock address data for testing risk assessment system
export const MOCK_ADDRESSES = {
  // HIGH RISK ADDRESSES
  '0x1234567890123456789012345678901234567890': {
    profile: {
      address: '0x1234567890123456789012345678901234567890',
      creation_date: '2024-01-15T10:30:00.000Z',
      tx_count: 5,
      funded_by: '0xScammerAddress123456789012345678901234567890',
      erc20_tokens: ['SCAMCOIN', 'RUGPULL', 'HONEYPOT'],
      interacted_contracts: [
        '0xHoneypotContract123456789012345678901234567890',
        '0xRugPullContract123456789012345678901234567890'
      ]
    },
    score: {
      emoji: '🔴',
      level: 'high',
      summary: 'This address is associated with known scam contracts and suspicious token transfers.',
      warning: 'HIGH RISK: This address has interacted with honeypot contracts and received funds from known scammer wallets. Do not send funds!'
    }
  },

  '0x9876543210987654321098765432109876543210': {
    profile: {
      address: '0x9876543210987654321098765432109876543210',
      creation_date: '2024-02-01T15:45:00.000Z',
      tx_count: 12,
      funded_by: '0xSuspiciousWallet123456789012345678901234567890',
      erc20_tokens: ['FAKE-USDC', 'PHISH-ETH'],
      interacted_contracts: [
        '0xPhishingContract123456789012345678901234567890',
        '0xFakeUniswapContract123456789012345678901234567890'
      ]
    },
    score: {
      emoji: '🔴',
      level: 'high',
      summary: 'Recently created address with phishing contract interactions.',
      warning: 'DANGER: This address appears to be involved in phishing operations. Avoid all interactions!'
    }
  },

  // MEDIUM RISK ADDRESSES
  '0xabcdef1234567890abcdef1234567890abcdef12': {
    profile: {
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      creation_date: '2023-06-10T08:20:00.000Z',
      tx_count: 45,
      funded_by: '0xUnknownWallet123456789012345678901234567890',
      erc20_tokens: ['USDC', 'WETH', 'UNKNOWNTOKEN'],
      interacted_contracts: [
        '0xUniswapV2Router123456789012345678901234567890',
        '0xUnverifiedContract123456789012345678901234567890'
      ]
    },
    score: {
      emoji: '🟡',
      level: 'medium',
      summary: 'Mixed activity with some unverified contract interactions.',
      warning: 'CAUTION: This address has interacted with some unverified contracts. Proceed with caution.'
    }
  },

  '0xfedcba0987654321fedcba0987654321fedcba09': {
    profile: {
      address: '0xfedcba0987654321fedcba0987654321fedcba09',
      creation_date: '2023-12-05T14:30:00.000Z',
      tx_count: 23,
      funded_by: 'unknown',
      erc20_tokens: ['DAI', 'LINK'],
      interacted_contracts: [
        '0xNewContract123456789012345678901234567890'
      ]
    },
    score: {
      emoji: '🟡',
      level: 'medium',
      summary: 'Relatively new address with limited transaction history.',
      warning: 'MODERATE RISK: New address with limited history. Exercise normal caution.'
    }
  },

  // LOW RISK ADDRESSES
  '0x742d35cc6634c0532925a3b8d431649f12ec4e8c': {
    profile: {
      address: '0x742d35cc6634c0532925a3b8d431649f12ec4e8c',
      creation_date: '2021-03-15T09:15:00.000Z',
      tx_count: 1247,
      funded_by: '0xCoinbaseExchange123456789012345678901234567890',
      erc20_tokens: ['USDC', 'USDT', 'WETH', 'UNI', 'LINK', 'AAVE'],
      interacted_contracts: [
        '0xUniswapV3Router123456789012345678901234567890',
        '0xAaveProtocol123456789012345678901234567890',
        '0xCompoundProtocol123456789012345678901234567890'
      ]
    },
    score: {
      emoji: '🟢',
      level: 'low',
      summary: 'Established address with extensive DeFi interaction history.',
      warning: 'LOW RISK: This appears to be a legitimate wallet with good transaction history.'
    }
  },

  '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': {
    profile: {
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      creation_date: '2020-08-22T11:45:00.000Z',
      tx_count: 892,
      funded_by: '0xBinanceExchange123456789012345678901234567890',
      erc20_tokens: ['USDC', 'WETH', 'UNI', 'SUSHI', 'CRV'],
      interacted_contracts: [
        '0xUniswapV2Router123456789012345678901234567890',
        '0xSushiswapRouter123456789012345678901234567890',
        '0xCurveProtocol123456789012345678901234567890'
      ]
    },
    score: {
      emoji: '🟢',
      level: 'low',
      summary: 'Veteran DeFi user with clean transaction history.',
      warning: 'SAFE: Well-established wallet with consistent DeFi usage patterns.'
    }
  },

  '0xa0b86991c426c6cc6cc6cc6cc6ccc6cc6cc6cc6cc': {
    profile: {
      address: '0xa0b86991c426c6cc6cc6cc6cc6ccc6cc6cc6cc6cc',
      creation_date: '2018-09-08T16:20:00.000Z',
      tx_count: 15420,
      funded_by: 'Initial deployment',
      erc20_tokens: [],
      interacted_contracts: []
    },
    score: {
      emoji: '🟢',
      level: 'low',
      summary: 'This is the official USDC token contract.',
      warning: 'VERIFIED: This is a verified token contract from Centre (USDC).'
    }
  },

  // DEFAULT/UNKNOWN ADDRESS
  'default': {
    profile: {
      address: 'unknown',
      creation_date: 'unknown',
      tx_count: 0,
      funded_by: 'unknown',
      erc20_tokens: [],
      interacted_contracts: []
    },
    score: {
      emoji: '🟡',
      level: 'medium',
      summary: 'Unable to verify this address.',
      warning: 'UNKNOWN: Could not gather enough information about this address. Proceed with caution.'
    }
  }
};

// Function to get mock data for an address
export function getMockAddressData(address) {
  if (!address) return null;
  
  // Convert to lowercase for consistent lookup
  const normalizedAddress = address.toLowerCase();
  
  // Check if we have specific data for this address
  for (const [mockAddress, data] of Object.entries(MOCK_ADDRESSES)) {
    if (mockAddress.toLowerCase() === normalizedAddress) {
      return data;
    }
  }
  
  // Return default data for unknown addresses
  return MOCK_ADDRESSES.default;
}

// List of test addresses for easy reference
export const TEST_ADDRESSES = {
  HIGH_RISK: [
    '0x1234567890123456789012345678901234567890',
    '0x9876543210987654321098765432109876543210'
  ],
  MEDIUM_RISK: [
    '0xabcdef1234567890abcdef1234567890abcdef12',
    '0xfedcba0987654321fedcba0987654321fedcba09'
  ],
  LOW_RISK: [
    '0x742d35cc6634c0532925a3b8d431649f12ec4e8c',
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    '0xa0b86991c426c6cc6cc6cc6cc6ccc6cc6cc6cc6cc'
  ]
};
