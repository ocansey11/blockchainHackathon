// VaultIQ Content Script - Injects Ethereum Provider into web pages

class VaultIQProvider {
  constructor() {
    this.isVaultIQ = true
    this.isMetaMask = false // Don't impersonate MetaMask
    this.chainId = null
    this.selectedAddress = null
    this.isConnected = false
    this.eventListeners = new Map()
    
    // Initialize connection check
    this.checkConnection()
  }

  // EIP-1193 Request method
  async request({ method, params = [] }) {
    console.log('VaultIQ Provider request:', method, params)
    
    try {
      switch (method) {
        case 'eth_requestAccounts':
          return await this.requestAccounts()
          
        case 'eth_accounts':
          return await this.getAccounts()
          
        case 'eth_chainId':
          return await this.getChainId()
          
        case 'net_version':
          const chainId = await this.getChainId()
          return parseInt(chainId, 16).toString()
          
        case 'eth_getBalance':
          return await this.getBalance(params[0], params[1])
          
        case 'eth_sendTransaction':
          return await this.sendTransaction(params[0])
          
        case 'personal_sign':
          return await this.personalSign(params[0], params[1])
          
        case 'eth_signTypedData_v4':
          return await this.signTypedData(params[1], params[0])
          
        case 'wallet_switchEthereumChain':
          return await this.switchChain(params[0])
          
        case 'wallet_addEthereumChain':
          return await this.addChain(params[0])
          
        default:
          throw new Error(`Method ${method} not supported`)
      }
    } catch (error) {
      console.error('VaultIQ Provider error:', error)
      throw error
    }
  }

  // Request account access
  async requestAccounts() {
    const response = await this.sendToExtension({
      type: 'REQUEST_ACCOUNTS',
      origin: window.location.origin
    })
    
    if (response.success) {
      this.selectedAddress = response.accounts[0]
      this.isConnected = true
      this.emit('accountsChanged', response.accounts)
      this.emit('connect', { chainId: this.chainId })
      return response.accounts
    } else {
      throw new Error(response.error || 'User rejected the request')
    }
  }

  // Get current accounts
  async getAccounts() {
    if (!this.isConnected) return []
    
    const response = await this.sendToExtension({
      type: 'GET_ACCOUNTS'
    })
    
    return response.success ? response.accounts : []
  }

  // Get current chain ID
  async getChainId() {
    const response = await this.sendToExtension({
      type: 'GET_CHAIN_ID'
    })
    
    if (response.success) {
      this.chainId = response.chainId
      return response.chainId
    }
    
    return '0x1' // Default to Ethereum mainnet
  }

  // Get balance
  async getBalance(address, blockTag = 'latest') {
    const response = await this.sendToExtension({
      type: 'GET_BALANCE',
      address,
      blockTag
    })
    
    if (response.success) {
      return response.balance
    }
    
    throw new Error(response.error || 'Failed to get balance')
  }

  // Send transaction
  async sendTransaction(txParams) {
    const response = await this.sendToExtension({
      type: 'SEND_TRANSACTION',
      transaction: txParams,
      origin: window.location.origin
    })
    
    if (response.success) {
      return response.hash
    }
    
    throw new Error(response.error || 'Transaction failed')
  }

  // Personal sign
  async personalSign(message, address) {
    const response = await this.sendToExtension({
      type: 'PERSONAL_SIGN',
      message,
      address,
      origin: window.location.origin
    })
    
    if (response.success) {
      return response.signature
    }
    
    throw new Error(response.error || 'Signature rejected')
  }

  // Sign typed data
  async signTypedData(address, typedData) {
    const response = await this.sendToExtension({
      type: 'SIGN_TYPED_DATA',
      typedData,
      address,
      origin: window.location.origin
    })
    
    if (response.success) {
      return response.signature
    }
    
    throw new Error(response.error || 'Signature rejected')
  }

  // Switch chain
  async switchChain({ chainId }) {
    const response = await this.sendToExtension({
      type: 'SWITCH_CHAIN',
      chainId
    })
    
    if (response.success) {
      this.chainId = chainId
      this.emit('chainChanged', chainId)
      return null
    }
    
    throw new Error(response.error || 'Chain switch failed')
  }

  // Add chain
  async addChain(chainParams) {
    const response = await this.sendToExtension({
      type: 'ADD_CHAIN',
      chainParams
    })
    
    if (response.success) {
      return null
    }
    
    throw new Error(response.error || 'Add chain failed')
  }

  // Check if already connected
  async checkConnection() {
    try {
      const response = await this.sendToExtension({
        type: 'CHECK_CONNECTION'
      })
      
      if (response.success && response.isConnected) {
        this.selectedAddress = response.account
        this.chainId = response.chainId
        this.isConnected = true
      }
    } catch (error) {
      console.log('Not connected to VaultIQ')
    }
  }

  // Send message to extension
  sendToExtension(message) {
    return new Promise((resolve) => {
      const messageId = Math.random().toString(36).substr(2, 9)
      
      const listener = (event) => {
        if (event.data.type === 'VAULTIQ_RESPONSE' && event.data.messageId === messageId) {
          window.removeEventListener('message', listener)
          resolve(event.data.response)
        }
      }
      
      window.addEventListener('message', listener)
      
      window.postMessage({
        type: 'VAULTIQ_REQUEST',
        messageId,
        data: message
      }, '*')
      
      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener('message', listener)
        resolve({ success: false, error: 'Request timeout' })
      }, 30000)
    })
  }

  // Event management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  removeListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }

  // Legacy methods for compatibility
  enable() {
    return this.request({ method: 'eth_requestAccounts' })
  }

  send(methodOrPayload, paramsOrCallback) {
    if (typeof methodOrPayload === 'string') {
      return this.request({ method: methodOrPayload, params: paramsOrCallback })
    } else {
      return this.request(methodOrPayload)
    }
  }

  sendAsync(payload, callback) {
    this.request(payload)
      .then(result => callback(null, { id: payload.id, result }))
      .catch(error => callback(error, null))
  }
}

// Inject VaultIQ provider into the page
function injectVaultIQ() {
  // Don't inject if already exists
  if (window.vaultiq) return
  
  const provider = new VaultIQProvider()
  
  // Make provider available
  window.vaultiq = provider
  
  // Also expose as ethereum if no other wallet is present
  if (!window.ethereum) {
    window.ethereum = provider
    
    // Dispatch ethereum provider event
    window.dispatchEvent(new Event('ethereum#initialized'))
  }
  
  console.log('VaultIQ provider injected')
}

// Inject immediately
injectVaultIQ()

// Also inject after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectVaultIQ)
} else {
  injectVaultIQ()
}