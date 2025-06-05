// Content script for web3 provider injection
(function() {
  'use strict';
  
  // Inject wallet provider into web pages
  if (typeof window.ethereum === 'undefined') {
    console.log('IntelliWallet: No existing wallet detected, initializing...');
    
    // Basic Web3 provider interface
    window.ethereum = {
      isIntelliWallet: true,
      isConnected: () => true,
      
      request: async (args) => {
        if (args.method === 'eth_accounts') {
          // Get wallet address from extension
          const response = await chrome.runtime.sendMessage({ action: 'getWalletInfo' });
          return response.hasWallet ? ['0x...'] : [];
        }
        
        if (args.method === 'eth_requestAccounts') {
          // Request account access
          return ['0x...'];
        }
        
        throw new Error(`Method ${args.method} not supported`);
      }
    };
    
    // Dispatch wallet events
    window.dispatchEvent(new Event('ethereum#initialized'));
  }
})();