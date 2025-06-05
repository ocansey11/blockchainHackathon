import React, { useState } from 'react'
import useAlchemy from '../hooks/useAlchemy'
import { NETWORKS, STORAGE_KEYS } from '../utils/constants'

const WalletDashboard = ({ wallet, onNavigate }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_NETWORK) || 'sepolia'
  })
  const [activeTab, setActiveTab] = useState('tokens')
  
  const { 
    balance, 
    tokenBalances, 
    transactionHistory, 
    loading, 
    updateAllData 
  } = useAlchemy(wallet?.address, selectedNetwork)

  const handleNetworkChange = (networkId) => {
    setSelectedNetwork(networkId)
    localStorage.setItem(STORAGE_KEYS.SELECTED_NETWORK, networkId)
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet?.address || '')
    alert('Address copied!')
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const currentNetwork = NETWORKS[selectedNetwork]

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: currentNetwork?.color || '#0066cc',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {currentNetwork?.symbol?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>Account 1</div>
            <div style={{ 
              fontSize: '12px', 
              color: '#888',
              cursor: 'pointer'
            }} onClick={copyAddress}>
              {formatAddress(wallet?.address)}
            </div>
          </div>
        </div>
        
        <select
          value={selectedNetwork}
          onChange={(e) => handleNetworkChange(e.target.value)}
          style={{
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '6px 12px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {Object.entries(NETWORKS).map(([key, network]) => (
            <option key={key} value={key} style={{ backgroundColor: '#333' }}>
              {network.name}
            </option>
          ))}
        </select>
      </header>

      {/* Balance Section */}
      <section style={{
        padding: '32px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #2a2a2a'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: '300',
          marginBottom: '8px',
          letterSpacing: '-1px'
        }}>
          {loading ? (
            <div style={{ color: '#666' }}>Loading...</div>
          ) : (
            <>
              {parseFloat(balance).toFixed(4)}
              <span style={{ 
                fontSize: '24px', 
                color: '#888',
                marginLeft: '8px'
              }}>
                {currentNetwork?.symbol}
              </span>
            </>
          )}
        </div>
        <div style={{ fontSize: '16px', color: '#666' }}>
          ≈ $0.00 USD
        </div>
      </section>

      {/* Action Buttons */}
      <section style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          <button
            onClick={() => onNavigate('send')}
            style={{
              padding: '16px',
              backgroundColor: '#0066cc',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0052a3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0066cc'}
          >
            <span style={{ fontSize: '20px' }}>↗</span>
            Send
          </button>
          
          <button
            onClick={() => onNavigate('receive')}
            style={{
              padding: '16px',
              backgroundColor: '#333',
              border: '1px solid #444',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#444'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#333'}
          >
            <span style={{ fontSize: '20px' }}>↙</span>
            Receive
          </button>
          
          <button
            onClick={updateAllData}
            disabled={loading}
            style={{
              padding: '16px',
              backgroundColor: '#333',
              border: '1px solid #444',
              borderRadius: '12px',
              color: loading ? '#666' : 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#444')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#333')}
          >
            <span style={{ 
              fontSize: '20px',
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }}>
              ⟳
            </span>
            Refresh
          </button>
        </div>
      </section>

      {/* Tabs */}
      <nav style={{
        display: 'flex',
        borderBottom: '1px solid #2a2a2a',
        marginLeft: '20px',
        marginRight: '20px'
      }}>
        {[
          { id: 'tokens', label: 'Tokens' },
          { id: 'activity', label: 'Activity' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 20px',
              background: 'none',
              border: 'none',
              color: activeTab === tab.id ? '#0066cc' : '#888',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #0066cc' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px'
      }}>
        {activeTab === 'tokens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Native Token */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: currentNetwork?.color || '#0066cc',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {currentNetwork?.symbol?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    {currentNetwork?.symbol}
                  </div>
                  <div style={{ fontSize: '14px', color: '#888' }}>
                    {currentNetwork?.name}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>
                  {parseFloat(balance).toFixed(4)}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>
                  $0.00
                </div>
              </div>
            </div>

            {/* ERC-20 Tokens */}
            {tokenBalances.map((token, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#444',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundImage: token.logo ? `url(${token.logo})` : 'none',
                    backgroundSize: 'cover'
                  }}>
                    {!token.logo && token.symbol?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {token.symbol}
                    </div>
                    <div style={{ fontSize: '14px', color: '#888' }}>
                      {token.name}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    {parseFloat(token.balance).toFixed(4)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#888' }}>
                    $0.00
                  </div>
                </div>
              </div>
            ))}

            {tokenBalances.length === 0 && !loading && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪙</div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No tokens yet
                </div>
                <div style={{ fontSize: '14px' }}>
                  Tokens will appear here when you receive them
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactionHistory.map((tx, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: tx.isOutgoing ? '#ff4444' : '#00aa44',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {tx.isOutgoing ? '↗' : '↙'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {tx.isOutgoing ? 'Sent' : 'Received'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#888' }}>
                      {tx.isOutgoing ? `To: ${formatAddress(tx.to)}` : `From: ${formatAddress(tx.from)}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {formatDate(tx.timestamp)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    color: tx.isOutgoing ? '#ff4444' : '#00aa44'
                  }}>
                    {tx.isOutgoing ? '-' : '+'}
                    {parseFloat(tx.value).toFixed(4)} {tx.asset}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Block #{tx.blockNum}
                  </div>
                </div>
              </div>
            ))}

            {transactionHistory.length === 0 && !loading && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No transactions yet
                </div>
                <div style={{ fontSize: '14px' }}>
                  Your transaction history will appear here
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #333',
              borderTop: '3px solid #0066cc',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
      </main>
    </div>
  )
}

export default WalletDashboard