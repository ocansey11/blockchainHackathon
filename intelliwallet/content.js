// Content script for web3 provider injection
(function() {
  'use strict';
  
  // Inject wallet provider into web pages
  if (typeof window.ethereum === 'undefined') {
    console.log('IntelliWallet: Initializing Web3 provider...');
    
    // Enhanced Web3 provider interface
    window.ethereum = {
      isIntelliWallet: true,
      isConnected: () => true,
      chainId: '0xaa36a7', // Sepolia chainId
      networkVersion: '11155111',
      
      request: async (args) => {
        console.log('IntelliWallet: Request received:', args.method);
        
        try {
          switch (args.method) {
            case 'eth_accounts':
            case 'eth_requestAccounts':
              // Get wallet info from extension
              const response = await chrome.runtime.sendMessage({ action: 'getWalletInfo' });
              if (response && response.hasWallet) {
                // In a real implementation, we'd get the actual address
                // For now, return empty array to indicate no connected accounts
                return [];
              }
              return [];
              
            case 'eth_chainId':
              return '0xaa36a7'; // Sepolia
              
            case 'net_version':
              return '11155111'; // Sepolia
              
            case 'wallet_requestPermissions':
              return [{ parentCapability: 'eth_accounts' }];
              
            case 'wallet_getPermissions':
              return [{ parentCapability: 'eth_accounts' }];
              
            default:
              throw new Error(`IntelliWallet: Method ${args.method} not supported`);
          }
        } catch (error) {
          console.error('IntelliWallet: Error handling request:', error);
          throw error;
        }
      },
      
      // Event handling
      on: (event, callback) => {
        console.log(`IntelliWallet: Listening for ${event}`);
      },
      
      removeListener: (event, callback) => {
        console.log(`IntelliWallet: Removing listener for ${event}`);
      }
    };
    
    // Dispatch wallet events
    window.dispatchEvent(new Event('ethereum#initialized'));
    
    // Announce wallet to the page
    const announcement = new CustomEvent('eip6963:announceProvider', {
      detail: {
        info: {
          uuid: 'intelliwallet-' + Math.random().toString(36).substr(2, 9),
          name: 'IntelliWallet',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwN2JmZiIvPgo8L3N2Zz4K',
          rdns: 'com.intelliwallet'
        },
        provider: window.ethereum
      }
    });
    
    window.dispatchEvent(announcement);
    console.log('IntelliWallet: Provider announced to page');
  } else {
    console.log('IntelliWallet: Existing wallet provider detected, skipping injection');
  }
})();