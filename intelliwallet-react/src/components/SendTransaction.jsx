import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { NETWORKS, STORAGE_KEYS } from '../utils/constants'
import useAlchemy from '../hooks/useAlchemy'
import { useRiskCheck } from '../hooks/useRiskCheck';
import RiskBadge from './RiskBadge';

const SendTransaction = ({ wallet, onBack }) => {
  const [selectedNetwork] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_NETWORK) || 'sepolia'
  })
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [gasPrice, setGasPrice] = useState('')
  const [gasLimit, setGasLimit] = useState('')
  const [loading, setLoading] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('form') // 'form', 'confirm', 'sending'

  const { balance, getGasPrice, estimateGas } = useAlchemy(wallet?.address, selectedNetwork)
  const { risk, isBlocked, loading: riskLoading } = useRiskCheck(recipient)
  const currentNetwork = NETWORKS[selectedNetwork]

  // Auto-estimate gas when transaction details change
  useEffect(() => {
    if (recipient && amount && ethers.utils.isAddress(recipient) && parseFloat(amount) > 0) {
      estimateTransactionGas()
    } else {
      setGasPrice('')
      setGasLimit('')
    }
  }, [recipient, amount])

  const estimateTransactionGas = async () => {
    setEstimating(true)
    setError('')
    try {
      const transaction = {
        to: recipient,
        value: ethers.utils.parseEther(amount || '0')
      }

      const [estimatedGas, currentGasPrice] = await Promise.all([
        estimateGas(transaction),
        getGasPrice()
      ])

      setGasLimit(estimatedGas.toString())
      setGasPrice(ethers.utils.formatUnits(currentGasPrice, 'gwei'))
    } catch (error) {
      console.error('Gas estimation failed:', error)
      setError('Failed to estimate gas fees')
    } finally {
      setEstimating(false)
    }
  }

  const calculateTotalCost = () => {
    if (!amount || !gasPrice || !gasLimit) return { amount: '0', fee: '0', total: '0' }
    
    try {
      const sendAmount = amount
      const gasPriceWei = ethers.utils.parseUnits(gasPrice, 'gwei')
      const totalFee = gasPriceWei.mul(gasLimit)
      const feeInEth = ethers.utils.formatEther(totalFee)
      const total = (parseFloat(sendAmount) + parseFloat(feeInEth)).toString()
      
      return {
        amount: sendAmount,
        fee: feeInEth,
        total: total
      }
    } catch {
      return { amount: '0', fee: '0', total: '0' }
    }
  }
  const validateTransaction = () => {
    if (!recipient) return 'Please enter a recipient address'
    if (!ethers.utils.isAddress(recipient)) return 'Invalid recipient address'
    if (!amount || parseFloat(amount) <= 0) return 'Please enter a valid amount'
    
    // Block high-risk transactions
    if (isBlocked) {
      return `⚠️ HIGH RISK ADDRESS DETECTED - Transaction blocked for your security. ${risk?.warning || 'This address has been flagged as potentially dangerous.'}`
    }
    
    const costs = calculateTotalCost()
    if (parseFloat(costs.total) > parseFloat(balance)) {
      return `Insufficient balance. Need ${costs.total} ${currentNetwork.symbol} (including fees)`
    }
    
    return null
  }

  const handleContinue = () => {
    const validationError = validateTransaction()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep('confirm')
  }

  const sendTransaction = async () => {
    setStep('sending')
    setLoading(true)
    setError('')
    
    try {
      const provider = new ethers.providers.JsonRpcProvider(currentNetwork.rpc)
      const walletWithProvider = wallet.connect(provider)
      
      const txParams = {
        to: recipient,
        value: ethers.utils.parseEther(amount)
      }

      if (gasPrice && gasLimit) {
        txParams.gasPrice = ethers.utils.parseUnits(gasPrice, 'gwei')
        txParams.gasLimit = gasLimit
      }
      
      const tx = await walletWithProvider.sendTransaction(txParams)
      
      // Show success and navigate back
      alert(`Transaction sent successfully!\n\nHash: ${tx.hash}\n\nView on explorer:\n${currentNetwork.explorer}/tx/${tx.hash}`)
      
      // Reset form and go back
      setRecipient('')
      setAmount('')
      setGasPrice('')
      setGasLimit('')
      onBack()
      
      // Wait for confirmation in background
      tx.wait().then(() => {
        console.log('Transaction confirmed')
      }).catch((error) => {
        console.error('Transaction confirmation failed:', error)
      })
      
    } catch (error) {
      console.error('Transaction failed:', error)
      setError(`Transaction failed: ${error.message}`)
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  const costs = calculateTotalCost()

  // Form Step
  if (step === 'form') {
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
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#0066cc',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              Send {currentNetwork?.symbol}
            </h1>
            <div style={{ fontSize: '14px', color: '#888', marginTop: '2px' }}>
              {currentNetwork?.name}
            </div>
          </div>
        </header>

        {/* Balance Info */}
        <section style={{
          padding: '20px',
          backgroundColor: '#2a2a2a',
          margin: '20px',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#888' }}>Available Balance</span>
            <span style={{ fontWeight: '600', fontSize: '16px' }}>
              {parseFloat(balance).toFixed(6)} {currentNetwork?.symbol}
            </span>
          </div>
        </section>

        {/* Form */}
        <main style={{ flex: 1, padding: '0 20px', overflow: 'auto' }}>
          {error && (
            <div style={{
              backgroundColor: '#330000',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#ff6666'
            }}>
              {error}
            </div>
          )}          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#ccc'
            }}>
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            
            {/* Risk Assessment Display */}
            {recipient && ethers.utils.isAddress(recipient) && (
              <div style={{ marginTop: '12px' }}>
                {riskLoading ? (
                  <div style={{
                    backgroundColor: '#333',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #444',
                      borderTop: '2px solid #0066cc',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Checking address safety...
                  </div>
                ) : risk ? (
                  <RiskBadge {...risk} />
                ) : null}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#ccc'
            }}>
              Amount ({currentNetwork?.symbol})
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#333',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={() => setAmount(balance)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#0066cc',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Gas Estimation */}
          {(gasPrice && gasLimit) && (
            <div style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ fontWeight: '600' }}>Network Fee</span>
                {estimating && (
                  <span style={{ color: '#888', fontSize: '12px' }}>Estimating...</span>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Gas Price</span>
                <span style={{ fontSize: '14px' }}>{parseFloat(gasPrice).toFixed(2)} Gwei</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Gas Limit</span>
                <span style={{ fontSize: '14px' }}>{gasLimit}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid #444'
              }}>
                <span style={{ fontWeight: '600' }}>Max Fee</span>
                <span style={{ fontWeight: '600' }}>
                  {parseFloat(costs.fee).toFixed(6)} {currentNetwork?.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Total Cost */}
          {amount && gasPrice && gasLimit && (
            <div style={{
              backgroundColor: '#0066cc20',
              border: '1px solid #0066cc',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Amount</span>
                <span>{costs.amount} {currentNetwork?.symbol}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Network Fee</span>
                <span>{parseFloat(costs.fee).toFixed(6)} {currentNetwork?.symbol}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid #0066cc40',
                fontWeight: '600'
              }}>
                <span>Total</span>
                <span>{parseFloat(costs.total).toFixed(6)} {currentNetwork?.symbol}</span>
              </div>
            </div>
          )}
        </main>        {/* Continue Button */}
        <footer style={{ padding: '20px' }}>
          <button
            onClick={handleContinue}
            disabled={!recipient || !amount || estimating || isBlocked}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: (!recipient || !amount || estimating || isBlocked) ? '#333' : '#0066cc',
              color: (!recipient || !amount || estimating || isBlocked) ? '#666' : 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!recipient || !amount || estimating || isBlocked) ? 'not-allowed' : 'pointer'
            }}
          >
            {estimating ? 'Estimating Gas...' : 
             isBlocked ? '🚫 Transaction Blocked' : 
             'Continue'}
          </button>
        </footer>
      </div>
    )
  }

  // Confirmation Step
  if (step === 'confirm') {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{
          padding: '16px 20px',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setStep('form')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0066cc',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            Confirm Transaction
          </h1>
        </header>

        <main style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>          {/* Transaction Details */}
          <div style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#ccc' }}>Transaction Details</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>To</div>
              <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{recipient}</div>
            </div>
            
            {/* Risk Assessment Display */}
            {risk && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Security Assessment</div>
                <RiskBadge {...risk} />
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Amount</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {amount} {currentNetwork?.symbol}
              </div>
            </div>
            
            <div>
              <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Network</div>
              <div>{currentNetwork?.name}</div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#ccc' }}>Cost Breakdown</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Amount</span>
              <span>{costs.amount} {currentNetwork?.symbol}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Network Fee</span>
              <span>{parseFloat(costs.fee).toFixed(6)} {currentNetwork?.symbol}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #444',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              <span>Total Cost</span>
              <span>{parseFloat(costs.total).toFixed(6)} {currentNetwork?.symbol}</span>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#330000',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              padding: '12px',
              color: '#ff6666'
            }}>
              {error}
            </div>
          )}
        </main>

        <footer style={{ padding: '20px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setStep('form')}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #444',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back
          </button>          <button
            onClick={sendTransaction}
            disabled={loading || isBlocked}
            style={{
              flex: 2,
              padding: '16px',
              backgroundColor: (loading || isBlocked) ? '#333' : '#0066cc',
              color: (loading || isBlocked) ? '#666' : 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || isBlocked) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : 
             isBlocked ? '🚫 Blocked' : 
             'Send Transaction'}
          </button>
        </footer>
      </div>
    )
  }

  // Sending Step
  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        border: '4px solid #333',
        borderTop: '4px solid #0066cc',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '24px'
      }}></div>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Sending Transaction</h2>
      <p style={{ margin: 0, color: '#888' }}>Please wait while your transaction is processed...</p>
    </div>
  )
}

export default SendTransaction