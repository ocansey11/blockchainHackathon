import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { STORAGE_KEYS, DEFAULT_PASSWORD } from '../utils/constants'

const useWallet = () => {
  const [wallet, setWallet] = useState(null)
  const [hasWallet, setHasWallet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    checkWalletExists()
  }, [])

  const checkWalletExists = async () => {
    try {
      const walletData = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_WALLET)
      setHasWallet(!!walletData)
    } catch (error) {
      console.error('Error checking wallet:', error)
      setHasWallet(false)
    } finally {
      setLoading(false)
    }
  }

  const unlockWallet = async (password = DEFAULT_PASSWORD) => {
    try {
      const encryptedWallet = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_WALLET)
      
      if (!encryptedWallet) {
        throw new Error('No wallet found')
      }

      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(
        encryptedWallet, 
        password
      )
      
      setWallet(decryptedWallet)
      setIsUnlocked(true)
      return decryptedWallet
    } catch (error) {
      console.error('Error unlocking wallet:', error)
      throw new Error('Invalid password')
    }
  }

  const createWallet = async (password = DEFAULT_PASSWORD) => {
    try {
      const newWallet = ethers.Wallet.createRandom()
      const encryptedWallet = await newWallet.encrypt(password)
      
      localStorage.setItem(STORAGE_KEYS.ENCRYPTED_WALLET, encryptedWallet)
      localStorage.setItem(STORAGE_KEYS.HAS_WALLET, 'true')
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, newWallet.address)
      
      setWallet(newWallet)
      setHasWallet(true)
      setIsUnlocked(true)
      
      return {
        wallet: newWallet,
        mnemonic: newWallet.mnemonic.phrase
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
    }
  }

  const importWallet = async (mnemonic, password = DEFAULT_PASSWORD) => {
    try {
      const importedWallet = ethers.Wallet.fromMnemonic(mnemonic.trim())
      const encryptedWallet = await importedWallet.encrypt(password)
      
      localStorage.setItem(STORAGE_KEYS.ENCRYPTED_WALLET, encryptedWallet)
      localStorage.setItem(STORAGE_KEYS.HAS_WALLET, 'true')
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, importedWallet.address)
      
      setWallet(importedWallet)
      setHasWallet(true)
      setIsUnlocked(true)
      
      return importedWallet
    } catch (error) {
      console.error('Error importing wallet:', error)
      throw new Error('Invalid mnemonic phrase')
    }
  }

  return {
    wallet,
    hasWallet,
    loading,
    isUnlocked,
    unlockWallet,
    createWallet,
    importWallet
  }
}

export default useWallet