// VaultIQ Background Script - Handles dApp communication

class VaultIQBackground {
  constructor() {
    this.setupMessageHandlers()
    this.pendingRequests = new Map()
  }

  setupMessageHandlers() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse)
      return true // Keep message channel open for async responses
    })

    // Setup message bridge for content scripts
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        this.injectMessageBridge(tabId)
      }
    })
  }

  async injectMessageBridge(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          // Bridge window.postMessage to chrome.runtime.sendMessage
          if (!window.vaultIQBridgeInstalled) {
            window.vaultIQBridgeInstalled = true
            
            window.addEventListener('message', (event) => {
              if (event.data.type === 'VAULTIQ_REQUEST' && event.source === window) {
                // Forward to background script
                try {
                  chrome.runtime.sendMessage(event.data.data, (response) => {
                    if (chrome.runtime.lastError) {
                      console.error('Chrome runtime error:', chrome.runtime.lastError)
                      return
                    }
                    // Send response back to content script
                    window.postMessage({
                      type: 'VAULTIQ_RESPONSE',
                      messageId: event.data.messageId,
                      response: response || { success: false, error: 'No response' }
                    }, '*')
                  })
                } catch (error) {
                  console.error('Error in message bridge:', error)
                  window.postMessage({
                    type: 'VAULTIQ_RESPONSE',
                    messageId: event.data.messageId,
                    response: { success: false, error: 'Bridge error: ' + error.message }
                  }, '*')
                }
              }
            })
            
            console.log('VaultIQ message bridge installed')
          }
        }
      })
    } catch (error) {
      // Tab not accessible or script already injected
      console.log('Could not inject message bridge:', error.message)
    }
  }

  async handleMessage(message, sender, sendResponse) {
    console.log('Background received message:', message.type, message)

    try {
      switch (message.type) {
        case 'REQUEST_ACCOUNTS':
          await this.handleRequestAccounts(message, sender, sendResponse)
          break

        case 'GET_ACCOUNTS':
          await this.handleGetAccounts(sendResponse)
          break

        case 'GET_CHAIN_ID':
          await this.handleGetChainId(sendResponse)
          break

        case 'GET_BALANCE':
          await this.handleGetBalance(message, sendResponse)
          break

        case 'SEND_TRANSACTION':
          await this.handleSendTransaction(message, sender, sendResponse)
          break

        case 'PERSONAL_SIGN':
          await this.handlePersonalSign(message, sender, sendResponse)
          break

        case 'SIGN_TYPED_DATA':
          await this.handleSignTypedData(message, sender, sendResponse)
          break

        case 'SWITCH_CHAIN':
          await this.handleSwitchChain(message, sendResponse)
          break

        case 'ADD_CHAIN':
          await this.handleAddChain(message, sendResponse)
          break

        case 'CHECK_CONNECTION':
          await this.handleCheckConnection(message, sender, sendResponse)
          break

        default:
          sendResponse({ success: false, error: `Unknown message type: ${message.type}` })
      }
    } catch (error) {
      console.error('Background script error:', error)
      sendResponse({ success: false, error: error.message })
    }
  }

  async handleRequestAccounts(message, sender, sendResponse) {
    console.log('Handling request accounts for:', message.origin)
    
    // Check if wallet exists and is unlocked
    const walletStatus = await this.getWalletStatus()
    
    if (!walletStatus.hasWallet) {
      sendResponse({ success: false, error: 'No wallet found. Please create a wallet in VaultIQ extension.' })
      return
    }

    if (!walletStatus.isUnlocked) {
      sendResponse({ success: false, error: 'Wallet is locked. Please unlock VaultIQ extension first.' })
      return
    }

    // Check if already connected to this origin
    const origin = this.getOriginFromSender(sender)
    const existingConnection = await this.checkConnectionPermission(origin)
    
    if (existingConnection) {
      const accounts = await this.getWalletAccounts()
      sendResponse({ success: true, accounts })
      return
    }

    // For now, auto-approve new connections (in production, show approval popup)
    console.log('Auto-approving connection request from:', origin)
    
    const accounts = await this.getWalletAccounts()
    if (accounts.length > 0) {
      // Store connection permission
      await this.storeConnectionPermission(origin, accounts[0])
      sendResponse({ success: true, accounts })
    } else {
      sendResponse({ success: false, error: 'No accounts available' })
    }
  }

  async handleGetAccounts(sendResponse) {
    try {
      const walletStatus = await this.getWalletStatus()
      if (!walletStatus.hasWallet || !walletStatus.isUnlocked) {
        sendResponse({ success: true, accounts: [] })
        return
      }

      const accounts = await this.getWalletAccounts()
      sendResponse({ success: true, accounts })
    } catch (error) {
      sendResponse({ success: true, accounts: [] })
    }
  }

  async handleGetChainId(sendResponse) {
    try {
      const chainId = await this.getCurrentChainId()
      sendResponse({ success: true, chainId })
    } catch (error) {
      sendResponse({ success: true, chainId: '0x1' })
    }
  }

  async handleGetBalance(message, sendResponse) {
    sendResponse({ success: false, error: 'Balance fetching via dApp not implemented. Use VaultIQ extension.' })
  }

  async handleSendTransaction(message, sender, sendResponse) {
    const walletStatus = await this.getWalletStatus()
    
    if (!walletStatus.hasWallet || !walletStatus.isUnlocked) {
      sendResponse({ success: false, error: 'Wallet locked or not found' })
      return
    }

    // For now, redirect to extension (implement approval popup in production)
    console.log('Transaction request from:', this.getOriginFromSender(sender), message.transaction)
    sendResponse({ 
      success: false, 
      error: 'Transaction approval not implemented yet. Please use the VaultIQ extension directly for transactions.' 
    })
  }

  async handlePersonalSign(message, sender, sendResponse) {
    const walletStatus = await this.getWalletStatus()
    
    if (!walletStatus.hasWallet || !walletStatus.isUnlocked) {
      sendResponse({ success: false, error: 'Wallet locked or not found' })
      return
    }

    console.log('Signature request from:', this.getOriginFromSender(sender))
    sendResponse({ success: false, error: 'Message signing not implemented yet' })
  }

  async handleSignTypedData(message, sender, sendResponse) {
    const walletStatus = await this.getWalletStatus()
    
    if (!walletStatus.hasWallet || !walletStatus.isUnlocked) {
      sendResponse({ success: false, error: 'Wallet locked or not found' })
      return
    }

    sendResponse({ success: false, error: 'Typed data signature not implemented yet' })
  }

  async handleSwitchChain(message, sendResponse) {
    try {
      const chainId = message.chainId
      const networkMap = {
        '0x1': 'ethereum',
        '0x89': 'polygon',
        '0xa4b1': 'arbitrum',
        '0xa': 'optimism',
        '0xaa36a7': 'sepolia',
        '0x13881': 'mumbai'
      }
      
      const network = networkMap[chainId]
      if (network) {
        await chrome.storage.local.set({ selected_network: network })
        console.log('Switched to network:', network)
        sendResponse({ success: true })
      } else {
        sendResponse({ success: false, error: `Unsupported network: ${chainId}` })
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message })
    }
  }

  async handleAddChain(message, sendResponse) {
    console.log('Add chain request:', message.chainParams)
    sendResponse({ success: false, error: 'Adding custom chains not implemented yet' })
  }

  async handleCheckConnection(message, sender, sendResponse) {
    try {
      const origin = this.getOriginFromSender(sender)
      const isConnected = await this.checkConnectionPermission(origin)
      const walletStatus = await this.getWalletStatus()
      
      if (isConnected && walletStatus.hasWallet && walletStatus.isUnlocked) {
        const accounts = await this.getWalletAccounts()
        const chainId = await this.getCurrentChainId()
        
        sendResponse({
          success: true,
          isConnected: true,
          account: accounts[0],
          chainId
        })
      } else {
        sendResponse({
          success: true,
          isConnected: false
        })
      }
    } catch (error) {
      sendResponse({
        success: true,
        isConnected: false
      })
    }
  }

  // Helper methods
  getOriginFromSender(sender) {
    if (sender.tab && sender.tab.url) {
      try {
        return new URL(sender.tab.url).origin
      } catch {
        return sender.tab.url
      }
    }
    return sender.origin || 'unknown'
  }

  async getWalletStatus() {
    try {
      const result = await chrome.storage.local.get(['has_wallet', 'encrypted_wallet'])
      return {
        hasWallet: !!(result.has_wallet || result.encrypted_wallet),
        isUnlocked: true // For now, assume unlocked if wallet exists
      }
    } catch {
      return { hasWallet: false, isUnlocked: false }
    }
  }

  async getWalletAccounts() {
    try {
      const result = await chrome.storage.local.get(['wallet_address'])
      return result.wallet_address ? [result.wallet_address] : []
    } catch {
      return []
    }
  }

  async getCurrentChainId() {
    try {
      const result = await chrome.storage.local.get(['selected_network'])
      const network = result.selected_network || 'ethereum'
      
      const chainIds = {
        'ethereum': '0x1',
        'polygon': '0x89',
        'arbitrum': '0xa4b1',
        'optimism': '0xa',
        'sepolia': '0xaa36a7',
        'mumbai': '0x13881'
      }
      
      return chainIds[network] || '0x1'
    } catch {
      return '0x1'
    }
  }

  async checkConnectionPermission(origin) {
    try {
      const result = await chrome.storage.local.get([`connection_${origin}`])
      return !!result[`connection_${origin}`]
    } catch {
      return false
    }
  }

  async storeConnectionPermission(origin, account) {
    try {
      await chrome.storage.local.set({
        [`connection_${origin}`]: {
          account,
          timestamp: Date.now()
        }
      })
      console.log('Stored connection permission for:', origin)
    } catch (error) {
      console.error('Failed to store connection permission:', error)
    }
  }
}

// Initialize background script
const vaultIQBackground = new VaultIQBackground()

console.log('VaultIQ background script loaded successfully')