import { useState, useEffect } from 'react'
import { Alchemy, Network } from 'alchemy-sdk'
import { ethers } from 'ethers'
import { ALCHEMY_API_KEY, NETWORKS } from '../utils/constants'

const useAlchemy = (walletAddress, selectedNetwork) => {
  const [balance, setBalance] = useState('0.0')
  const [tokenBalances, setTokenBalances] = useState([])
  const [transactionHistory, setTransactionHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (walletAddress && selectedNetwork) {
      updateAllData()
    }
  }, [walletAddress, selectedNetwork])

  const getAlchemyInstance = (networkId) => {
    const network = NETWORKS[networkId]
    if (!network?.alchemyNetwork) return null
    
    const settings = {
      apiKey: ALCHEMY_API_KEY,
      network: Network[network.alchemyNetwork]
    }
    return new Alchemy(settings)
  }

  const updateAllData = async () => {
    if (!walletAddress || !selectedNetwork) return

    setLoading(true)
    setError('')
    
    try {
      await Promise.all([
        updateBalance(),
        updateTokenBalances(),
        updateTransactionHistory()
      ])
    } catch (error) {
      console.error('Error updating wallet data:', error)
      setError('Failed to fetch wallet data')
    } finally {
      setLoading(false)
    }
  }

  const updateBalance = async () => {
    try {
      const alchemy = getAlchemyInstance(selectedNetwork)
      if (!alchemy) {
        // Fallback to ethers provider for non-Alchemy networks
        const network = NETWORKS[selectedNetwork]
        const provider = new ethers.providers.JsonRpcProvider(network.rpc)
        const balanceWei = await provider.getBalance(walletAddress)
        const balanceEth = ethers.utils.formatEther(balanceWei)
        setBalance(parseFloat(balanceEth).toFixed(6))
        return
      }

      const balanceWei = await alchemy.core.getBalance(walletAddress)
      const balanceEth = ethers.utils.formatEther(balanceWei)
      setBalance(parseFloat(balanceEth).toFixed(6))
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance('0.0')
    }
  }

  const updateTokenBalances = async () => {
    try {
      const alchemy = getAlchemyInstance(selectedNetwork)
      if (!alchemy) {
        setTokenBalances([])
        return
      }

      // Get token balances (ERC-20 tokens)
      const balances = await alchemy.core.getTokenBalances(walletAddress)
      
      const tokenData = await Promise.all(
        balances.tokenBalances
          .filter(token => token.tokenBalance !== '0x0')
          .slice(0, 10) // Limit to first 10 tokens
          .map(async (token) => {
            try {
              const metadata = await alchemy.core.getTokenMetadata(token.contractAddress)
              const balance = ethers.utils.formatUnits(
                token.tokenBalance, 
                metadata.decimals || 18
              )
              
              return {
                contractAddress: token.contractAddress,
                name: metadata.name || 'Unknown Token',
                symbol: metadata.symbol || 'UNKNOWN',
                balance: parseFloat(balance).toFixed(6),
                decimals: metadata.decimals || 18,
                logo: metadata.logo
              }
            } catch (error) {
              console.error('Error fetching token metadata:', error)
              return null
            }
          })
      )

      setTokenBalances(tokenData.filter(token => token !== null))
    } catch (error) {
      console.error('Error fetching token balances:', error)
      setTokenBalances([])
    }
  }

  const updateTransactionHistory = async () => {
    try {
      const alchemy = getAlchemyInstance(selectedNetwork)
      if (!alchemy) {
        setTransactionHistory([])
        return
      }

      // Get recent transactions - both sent and received
      const [sentTransfers, receivedTransfers] = await Promise.all([
        alchemy.core.getAssetTransfers({
          fromAddress: walletAddress,
          category: ['external', 'erc20'],
          maxCount: 20,
          order: 'desc'
        }).catch(error => {
          console.log('Error fetching sent transfers:', error)
          return { transfers: [] }
        }),
        alchemy.core.getAssetTransfers({
          toAddress: walletAddress,
          category: ['external', 'erc20'],
          maxCount: 20,
          order: 'desc'
        }).catch(error => {
          console.log('Error fetching received transfers:', error)
          return { transfers: [] }
        })
      ])

      // Combine and sort transactions
      const allTransfers = [...(sentTransfers.transfers || []), ...(receivedTransfers.transfers || [])]
      
      // Filter out duplicates and format transactions
      const seenHashes = new Set()
      const formattedTransactions = allTransfers
        .filter(transfer => {
          if (!transfer.hash || seenHashes.has(transfer.hash)) {
            return false
          }
          seenHashes.add(transfer.hash)
          return true
        })
        .map(transfer => {
          // Safe access to nested properties
          const timestamp = transfer.metadata?.blockTimestamp || 
                           transfer.blockTimestamp || 
                           new Date().toISOString()
          
          const blockNum = transfer.blockNum || 'Unknown'
          const value = transfer.value || '0'
          const asset = transfer.asset || 'ETH'
          
          return {
            hash: transfer.hash,
            from: transfer.from || '',
            to: transfer.to || '',
            value: value,
            asset: asset,
            category: transfer.category || 'external',
            timestamp: timestamp,
            blockNum: blockNum,
            isOutgoing: (transfer.from || '').toLowerCase() === walletAddress.toLowerCase()
          }
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 30) // Keep latest 30 transactions

      console.log('Formatted transactions:', formattedTransactions)
      setTransactionHistory(formattedTransactions)
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      setTransactionHistory([])
    }
  }

  const getGasPrice = async () => {
    try {
      const alchemy = getAlchemyInstance(selectedNetwork)
      if (!alchemy) {
        const network = NETWORKS[selectedNetwork]
        const provider = new ethers.providers.JsonRpcProvider(network.rpc)
        return await provider.getGasPrice()
      }

      return await alchemy.core.getGasPrice()
    } catch (error) {
      console.error('Error fetching gas price:', error)
      return ethers.utils.parseUnits('20', 'gwei') // Fallback gas price
    }
  }

  const estimateGas = async (transaction) => {
    try {
      const alchemy = getAlchemyInstance(selectedNetwork)
      if (!alchemy) {
        const network = NETWORKS[selectedNetwork]
        const provider = new ethers.providers.JsonRpcProvider(network.rpc)
        return await provider.estimateGas(transaction)
      }

      return await alchemy.core.estimateGas(transaction)
    } catch (error) {
      console.error('Error estimating gas:', error)
      return ethers.BigNumber.from('21000') // Fallback gas limit
    }
  }

  return {
    balance,
    tokenBalances,
    transactionHistory,
    loading,
    error,
    updateAllData,
    updateBalance,
    getGasPrice,
    estimateGas
  }
}

export default useAlchemy