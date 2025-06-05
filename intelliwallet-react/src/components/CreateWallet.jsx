import React, { useState } from 'react'
import useWallet from '../hooks/useWallet'

const CreateWallet = ({ onComplete }) => {
  const [step, setStep] = useState('welcome') // 'welcome', 'mnemonic', 'import'
  const [mnemonic, setMnemonic] = useState('')
  const [importMnemonic, setImportMnemonic] = useState('')
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const { createWallet, importWallet } = useWallet()

  const handleCreateWallet = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await createWallet(password || undefined)
      setMnemonic(result.mnemonic)
      setStep('mnemonic')
    } catch (error) {
      console.error('Error creating wallet:', error)
      setError('Failed to create wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic)
    alert('Copied to clipboard!')
  }

  const handleContinue = () => {
    // The wallet is already created and unlocked in handleCreateWallet
    // Just call onComplete to trigger the flow in App.jsx
    if (onComplete) {
      onComplete()
    }
  }

  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      setError('Please enter a valid mnemonic phrase')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      await importWallet(importMnemonic, password || undefined)
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error importing wallet:', error)
      setError('Invalid mnemonic phrase')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    container: {
      height: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    },
    logo: {
      width: '80px',
      height: '80px',
      backgroundColor: '#0066cc',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '30px',
      fontSize: '32px',
      fontWeight: 'bold'
    },
    title: {
      fontSize: '36px',
      marginBottom: '10px',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: '18px',
      color: '#888',
      marginBottom: '40px',
      textAlign: 'center'
    },
    input: {
      width: '100%',
      maxWidth: '400px',
      padding: '15px',
      marginBottom: '15px',
      backgroundColor: '#333',
      border: '1px solid #555',
      borderRadius: '8px',
      color: 'white',
      fontSize: '16px'
    },
    textarea: {
      width: '100%',
      maxWidth: '400px',
      padding: '15px',
      marginBottom: '15px',
      backgroundColor: '#333',
      border: '1px solid #555',
      borderRadius: '8px',
      color: 'white',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical'
    },
    button: {
      width: '100%',
      maxWidth: '400px',
      padding: '15px',
      backgroundColor: '#0066cc',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '10px'
    },
    buttonSecondary: {
      width: '100%',
      maxWidth: '400px',
      padding: '15px',
      backgroundColor: '#333',
      color: 'white',
      border: '1px solid #555',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer'
    },
    error: {
      color: '#ff6b6b',
      marginBottom: '15px',
      textAlign: 'center',
      maxWidth: '400px'
    },
    mnemonicContainer: {
      backgroundColor: '#333',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      maxWidth: '400px',
      width: '100%'
    },
    mnemonicGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginBottom: '20px'
    },
    mnemonicWord: {
      backgroundColor: '#444',
      padding: '10px',
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center'
    },
    wordNumber: {
      color: '#888',
      marginRight: '10px',
      minWidth: '20px'
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: '#0066cc',
      cursor: 'pointer',
      fontSize: '16px',
      marginBottom: '20px',
      alignSelf: 'flex-start'
    }
  }

  if (step === 'welcome') {
    return (
      <div style={styles.container}>
        <div style={styles.logo}>
          <img 
            src="/logo.png" 
            alt="VaultIQ" 
            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
            onError={(e) => {
              // Fallback to text if image fails to load
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div style={{ 
            display: 'none',
            width: '80px', 
            height: '80px', 
            backgroundColor: '#0066cc', 
            borderRadius: '50%', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            V
          </div>
        </div>
        <h1 style={styles.title}>VaultIQ</h1>
        <p style={styles.subtitle}>Your intelligent crypto wallet</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <input
          type="password"
          placeholder="Password (optional - leave empty for default)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        
        <button
          onClick={handleCreateWallet}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Creating...' : 'Create New Wallet'}
        </button>
        
        <button
          onClick={() => setStep('import')}
          style={styles.buttonSecondary}
        >
          Import Existing Wallet
        </button>
      </div>
    )
  }

  if (step === 'mnemonic') {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Backup Your Wallet</h1>
        <p style={styles.subtitle}>Save these 12 words securely. Never share them!</p>
        
        <div style={styles.mnemonicContainer}>
          <div style={styles.mnemonicGrid}>
            {mnemonic.split(' ').map((word, index) => (
              <div key={index} style={styles.mnemonicWord}>
                <span style={styles.wordNumber}>{index + 1}.</span>
                <span>{showMnemonic ? word : '●●●●●●'}</span>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button
              onClick={() => setShowMnemonic(!showMnemonic)}
              style={{ ...styles.buttonSecondary, width: '48%' }}
            >
              {showMnemonic ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={handleCopyMnemonic}
              style={{ ...styles.buttonSecondary, width: '48%' }}
            >
              Copy
            </button>
          </div>
        </div>

        <button
          onClick={handleContinue}
          style={styles.button}
        >
          Continue to Wallet
        </button>
      </div>
    )
  }

  if (step === 'import') {
    return (
      <div style={styles.container}>
        <button 
          onClick={() => setStep('welcome')}
          style={styles.backButton}
        >
          ← Back
        </button>
        
        <h1 style={styles.title}>Import Wallet</h1>
        <p style={styles.subtitle}>Enter your 12-word recovery phrase</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <textarea
          value={importMnemonic}
          onChange={(e) => setImportMnemonic(e.target.value)}
          placeholder="Enter your recovery phrase (12 words separated by spaces)"
          style={styles.textarea}
        />
        
        <input
          type="password"
          placeholder="Password (optional - leave empty for default)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={handleImportWallet}
          disabled={!importMnemonic.trim() || loading}
          style={styles.button}
        >
          {loading ? 'Importing...' : 'Import Wallet'}
        </button>
      </div>
    )
  }

  return null
}

export default CreateWallet