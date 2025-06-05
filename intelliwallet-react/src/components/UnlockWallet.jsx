import React, { useState } from 'react'

const UnlockWallet = ({ onUnlock }) => {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUnlock = async () => {
    setLoading(true)
    setError('')
    try {
      await onUnlock(password)
    } catch (error) {
      console.error('Unlock failed:', error)
      setError('Invalid password')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUnlock()
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
      cursor: 'pointer'
    },
    error: {
      color: '#ff6b6b',
      marginBottom: '15px',
      textAlign: 'center',
      maxWidth: '400px'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.logo}>
        <img 
          src="/logo.png" 
          alt="VaultIQ" 
          style={{ width: '60px', height: '60px', objectFit: 'contain' }}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'block'
          }}
        />
        <div style={{ display: 'none', fontSize: '60px' }}>🔒</div>
      </div>
      <h1 style={styles.title}>Welcome Back</h1>
      <p style={styles.subtitle}>Enter your password to unlock VaultIQ</p>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <input
        type="password"
        placeholder="Enter password (or leave empty for default)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        style={styles.input}
      />

      <button
        onClick={handleUnlock}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Unlocking...' : 'Unlock Wallet'}
      </button>
    </div>
  )
}

export default UnlockWallet