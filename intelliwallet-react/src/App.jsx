import React, { useState } from 'react'
import UnlockWallet from './components/UnlockWallet'
import WalletDashboard from './components/WalletDashboard'
import CreateWallet from './components/CreateWallet'
import SendTransaction from './components/SendTransaction'
import ReceiveView from './components/ReceiveView'
import useWallet from './hooks/useWallet'

function App() {
  const { wallet, hasWallet, loading, isUnlocked, unlockWallet } = useWallet()
  const [currentView, setCurrentView] = useState('main') // 'main', 'send', 'receive'

  const handleUnlock = async (password) => {
    try {
      await unlockWallet(password)
    } catch (error) {
      throw error
    }
  }

  const handleWalletComplete = () => {
    // The wallet state should already be updated by useWallet hook
    // This callback can be used for additional actions if needed
  }

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #333',
            borderTop: '2px solid #0066cc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }}></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    )
  }

  // No wallet exists - show create/import screen
  if (!hasWallet) {
    return <CreateWallet onComplete={handleWalletComplete} />
  }

  // Wallet exists but not unlocked - show unlock screen
  if (hasWallet && !isUnlocked) {
    return <UnlockWallet onUnlock={handleUnlock} />
  }

  // Show different views based on currentView state
  if (currentView === 'send') {
    return (
      <SendTransaction 
        wallet={wallet} 
        onBack={() => setCurrentView('main')} 
      />
    )
  }

  if (currentView === 'receive') {
    return (
      <ReceiveView 
        wallet={wallet} 
        onBack={() => setCurrentView('main')} 
      />
    )
  }

  // Main dashboard
  return (
    <WalletDashboard 
      wallet={wallet} 
      onNavigate={setCurrentView}
    />
  )
}

export default App