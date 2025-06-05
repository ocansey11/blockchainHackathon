import React, { useState } from 'react'
import { NETWORKS, STORAGE_KEYS } from '../utils/constants'

const ReceiveView = ({ wallet, onBack }) => {
  const [selectedNetwork] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_NETWORK) || 'ethereum'
  })

  const currentNetwork = NETWORKS[selectedNetwork]

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet?.address || '')
    alert('Address copied to clipboard!')
  }

  const generateQRCode = () => {
    // Simple QR code generation using a service
    const qrSize = 200
    const qrData = encodeURIComponent(wallet?.address || '')
    return `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${qrData}`
  }

  const styles = {
    container: {
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '30px'
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: '#0066cc',
      cursor: 'pointer',
      fontSize: '18px',
      marginRight: '15px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold'
    },
    content: {
      flex: 1,
      maxWidth: '400px',
      margin: '0 auto',
      width: '100%',
      textAlign: 'center'
    },
    networkInfo: {
      backgroundColor: '#333',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '30px'
    },
    qrContainer: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '30px',
      display: 'inline-block'
    },
    qrCode: {
      width: '200px',
      height: '200px',
      display: 'block'
    },
    addressContainer: {
      backgroundColor: '#333',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      wordBreak: 'break-all'
    },
    addressLabel: {
      color: '#888',
      marginBottom: '10px',
      fontSize: '14px'
    },
    address: {
      fontSize: '16px',
      fontFamily: 'monospace',
      lineHeight: '1.5'
    },
    button: {
      width: '100%',
      padding: '15px',
      backgroundColor: '#0066cc',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    warning: {
      backgroundColor: '#664400',
      border: '1px solid #ffaa00',
      color: '#ffaa00',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>Receive {currentNetwork?.symbol}</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.networkInfo}>
          <strong>Network:</strong> {currentNetwork?.name}
          <br />
          <small>Only send {currentNetwork?.symbol} to this address on {currentNetwork?.name}</small>
        </div>

        <div style={styles.warning}>
          ⚠️ Only send {currentNetwork?.symbol} tokens to this address. Sending other tokens or using wrong networks may result in permanent loss.
        </div>

        <div style={styles.qrContainer}>
          <img 
            src={generateQRCode()} 
            alt="Wallet QR Code"
            style={styles.qrCode}
          />
        </div>

        <div style={styles.addressContainer}>
          <div style={styles.addressLabel}>Your {currentNetwork?.symbol} Address:</div>
          <div style={styles.address}>{wallet?.address}</div>
        </div>

        <button onClick={copyAddress} style={styles.button}>
          Copy Address
        </button>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
          <p>Share this address to receive {currentNetwork?.symbol} on {currentNetwork?.name}</p>
          <p>You can also share the QR code for easy scanning</p>
        </div>
      </div>
    </div>
  )
}

export default ReceiveView