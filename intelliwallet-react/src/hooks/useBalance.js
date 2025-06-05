import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { NETWORKS } from '../utils/constants'

const useBalance = (walletAddress, selectedNetwork) => {
  const [balance, setBalance] = useState('0.0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (walletAddress && selectedNetwork) {
      updateBalance()
    }
  }, [walletAddress, selectedNetwork])

  const updateBalance = async () => {
    if (!walletAddress || !selectedNetwork) return

    setLoading(true)
    setError('')
    
    try {
      const network = NETWORKS[selectedNetwork]
      if (!network) {
        throw new Error('Invalid network')
      }

      const provider = new ethers.providers.JsonRpcProvider(network.rpc)
      const balanceWei = await provider.getBalance(walletAddress)
      const balanceEth = ethers.utils.formatEther(balanceWei)
      
      setBalance(parseFloat(balanceEth).toFixed(6))
    } catch (error) {
      console.error('Error fetching balance:', error)
      setError('Failed to fetch balance')
      setBalance('0.0')
    } finally {
      setLoading(false)
    }
  }

  return {
    balance,
    loading,
    error,
    updateBalance
  }
}

export default useBalance