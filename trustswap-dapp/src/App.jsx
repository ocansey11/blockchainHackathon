import React, { useState, useEffect } from 'react';

const TrustSwapDApp = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [swapAmount, setSwapAmount] = useState('');

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await updateChainInfo();
          await getBalance(accounts[0]);
        }
      } catch (error) {
        console.error('Connection check failed:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          getBalance(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(chainId);
        window.location.reload();
      });
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('No wallet detected. Please install a Web3 wallet.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setAccount(accounts[0]);
      setIsConnected(true);
      await updateChainInfo();
      await getBalance(accounts[0]);
      
    } catch (error) {
      console.error('Connection failed:', error);
      setError(`Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
    setChainId(null);
  };

  const updateChainInfo = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
    } catch (error) {
      console.error('Failed to get chain ID:', error);
    }
  };

  const getBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      // Convert from wei to ether (simplified)
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(ethBalance.toFixed(4));
    } catch (error) {
      console.error('Failed to get balance:', error);
      setBalance('0');
    }
  };

  const performSwap = async () => {
    if (!swapAmount || !account) return;

    setLoading(true);
    try {
      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: '0x742d35Cc6634C0532925a3b8c7c7C7b1e2948CcC', // Example address
          value: (parseFloat(swapAmount) * Math.pow(10, 18)).toString(16),
          gas: '0x5208',
        }]
      });
      
      alert(`Swap transaction sent! Hash: ${tx}`);
      setSwapAmount('');
    } catch (error) {
      setError(`Swap failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const switchToEthereum = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
    } catch (error) {
      setError(`Network switch failed: ${error.message}`);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x89': 'Polygon',
      '0xa4b1': 'Arbitrum',
      '0xa': 'Optimism',
      '0xaa36a7': 'Sepolia Testnet',
      '0x13881': 'Mumbai Testnet'
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #00ff88, #00aaff)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              T
            </div>
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: '24px',
              fontWeight: '600'
            }}>
              TrustSwap DEX
            </h1>
          </div>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #00ff88, #00aaff)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '12px'
            }}>
              <div>
                <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                  {formatAddress(account)}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                  {balance} ETH • {getNetworkName(chainId)}
                </div>
              </div>
              <button
                onClick={disconnectWallet}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {error && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            color: '#ff6b6b'
          }}>
            {error}
          </div>
        )}

        {/* Swap Interface */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '500px',
          margin: '0 auto',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            color: 'white',
            margin: '0 0 30px 0',
            fontSize: '28px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Token Swap
          </h2>

          {!isConnected ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                Connect your wallet to start swapping
              </p>
              <button
                onClick={connectWallet}
                style={{
                  background: 'linear-gradient(135deg, #00ff88, #00aaff)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div>
              {/* From Token */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>From</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Balance: {balance} ETH
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.0"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: 'linear-gradient(135deg, #627eea, #8a92b2)',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ color: 'white', fontWeight: '600' }}>ETH</span>
                  </div>
                </div>
              </div>

              {/* Swap Arrow */}
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  padding: '12px',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  ↓
                </div>
              </div>

              {/* To Token */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>To</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Balance: 0.0
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    flex: 1,
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '24px',
                    fontWeight: '600'
                  }}>
                    {swapAmount ? (parseFloat(swapAmount) * 1850).toFixed(2) : '0.0'}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '8px 12px',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: 'linear-gradient(135deg, #f7931a, #ffb74d)',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ color: 'white', fontWeight: '600' }}>TRUST</span>
                  </div>
                </div>
              </div>

              {/* Network Warning */}
              {chainId !== '0x1' && (
                <div style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#ffc107', margin: '0 0 10px 0' }}>
                    Switch to Ethereum Mainnet for best rates
                  </p>
                  <button
                    onClick={switchToEthereum}
                    style={{
                      background: '#ffc107',
                      color: '#000',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Switch Network
                  </button>
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={performSwap}
                disabled={!swapAmount || loading || parseFloat(swapAmount) <= 0}
                style={{
                  width: '100%',
                  background: (!swapAmount || loading || parseFloat(swapAmount) <= 0) 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'linear-gradient(135deg, #00ff88, #00aaff)',
                  color: 'white',
                  border: 'none',
                  padding: '18px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: (!swapAmount || loading || parseFloat(swapAmount) <= 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Swapping...' : 
                 !swapAmount ? 'Enter Amount' :
                 parseFloat(swapAmount) <= 0 ? 'Invalid Amount' :
                 'Swap Tokens'}
              </button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '60px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 16px 0' }}>🔒 Secure Trading</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
              Your funds are protected by industry-leading security protocols and smart contract audits.
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 16px 0' }}>⚡ Low Fees</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
              Trade with minimal fees and get the best rates across multiple DEX protocols.
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 16px 0' }}>🌐 Multi-Chain</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
              Trade across Ethereum, Polygon, Arbitrum, and more chains seamlessly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '20px 40px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '60px'
      }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
          © 2024 TrustSwap DEX. Built for testing VaultIQ wallet integration.
        </p>
      </footer>
    </div>
  );
};

export default TrustSwapDApp;