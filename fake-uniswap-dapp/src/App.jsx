import React, { useState, useEffect } from 'react';

const FakeUniswapDApp = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [swapAmount, setSwapAmount] = useState('');
  const [showFakeModal, setShowFakeModal] = useState(false);
  const [fakePrivateKey, setFakePrivateKey] = useState('');

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
      setError('No wallet detected. Please install MetaMask or similar wallet.');
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
      
      // Malicious: Immediately try to get users to sign something
      setTimeout(() => {
        setShowFakeModal(true);
      }, 2000);
      
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
    setShowFakeModal(false);
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
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(ethBalance.toFixed(4));
    } catch (error) {
      console.error('Failed to get balance:', error);
      setBalance('0');
    }
  };

  // Malicious function - tries to get user to sign malicious transaction
  const performMaliciousSwap = async () => {
    if (!swapAmount || !account) return;

    setLoading(true);
    try {
      // This tries to send ALL user's ETH to a malicious address
      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: '0x000000000000000000000000000000000000dEaD', // Burn address (safe for testing)
          value: (parseFloat(balance) * 0.99 * Math.pow(10, 18)).toString(16), // 99% of balance
          gas: '0x5208',
        }]
      });
      
      alert(`⚠️ MALICIOUS TRANSACTION SENT! Hash: ${tx}\n\nThis would have drained your wallet in a real attack!`);
      setSwapAmount('');
    } catch (error) {
      setError(`Transaction failed: ${error.message}`);
      alert('Good! Your wallet protected you from a malicious transaction attempt.');
    } finally {
      setLoading(false);
    }
  };

  // Malicious function - tries to get private key
  const handleFakeVerification = async () => {
    if (!fakePrivateKey) {
      setError('Please enter your private key to verify ownership');
      return;
    }

    // In a real attack, this would send the private key to a malicious server
    console.log('⚠️ ATTEMPTED PRIVATE KEY THEFT:', fakePrivateKey);
    alert(`⚠️ PHISHING ATTEMPT DETECTED!\n\nThis site tried to steal your private key: ${fakePrivateKey}\n\nNEVER enter your private key on any website!`);
    setShowFakeModal(false);
    setFakePrivateKey('');
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
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      {/* Fake Security Notice */}
      <div style={{
        background: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 20px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        ⚠️ PHISHING SIMULATION - This is a fake malicious site for testing purposes
      </div>

      {/* Header - Looks like Uniswap but slightly off */}
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
            {/* Fake Uniswap logo */}
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #ff006e, #8338ec)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              🦄
            </div>
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Uniswap V4 Beta {/* Fake version to seem legitimate */}
            </h1>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              BETA
            </span>
          </div>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #ff006e, #8338ec)',
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

      {/* Fake Modal for "Verification" */}
      {showFakeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
            <h3 style={{ color: '#000', marginBottom: '16px' }}>Wallet Verification Required</h3>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              Due to new security regulations, please verify your wallet ownership by entering your private key or seed phrase.
            </p>
            <input
              type="password"
              value={fakePrivateKey}
              onChange={(e) => setFakePrivateKey(e.target.value)}
              placeholder="Enter private key or seed phrase"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowFakeModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f0f0f0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleFakeVerification}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ff006e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Fake "Limited Time" Offer */}
        <div style={{
          background: 'linear-gradient(135deg, #ffd700, #ffae00)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center',
          color: '#000',
          animation: 'pulse 2s infinite'
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>🚀 LIMITED TIME: 500% APY!</h2>
          <p style={{ margin: 0, fontSize: '16px' }}>
            Exclusive Uniswap V4 Beta rewards! Swap now to earn massive yields!
          </p>
        </div>

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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: 'white',
              margin: 0,
              fontSize: '28px',
              fontWeight: '600'
            }}>
              Swap
            </h2>
            <div style={{
              background: 'rgba(255, 0, 0, 0.2)',
              color: '#ff6b6b',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              animation: 'blink 1s infinite'
            }}>
              URGENT: ACT NOW!
            </div>
          </div>

          {!isConnected ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                Connect your wallet to access exclusive Beta features
              </p>
              <button
                onClick={connectWallet}
                style={{
                  background: 'linear-gradient(135deg, #ff006e, #8338ec)',
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

              {/* Malicious Swap Arrow with warning */}
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255, 0, 0, 0.3)',
                  borderRadius: '50%',
                  padding: '12px',
                  color: 'white',
                  fontSize: '20px',
                  animation: 'pulse 2s infinite'
                }}>
                  ⚠️
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
                    {swapAmount ? (parseFloat(swapAmount) * 10000).toFixed(2) : '0.0'}
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
                      background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ color: 'white', fontWeight: '600' }}>SCAM</span>
                  </div>
                </div>
              </div>

              {/* Fake "Too Good to be True" rates */}
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#ffd700', margin: '0 0 10px 0', fontWeight: '600' }}>
                  🎉 AMAZING RATE: 1 ETH = 10,000 SCAM tokens! 
                </p>
                <p style={{ color: '#ffd700', margin: 0, fontSize: '12px' }}>
                  Limited time Beta rate - 1000x better than other exchanges!
                </p>
              </div>

              {/* Malicious Swap Button */}
              <button
                onClick={performMaliciousSwap}
                disabled={!swapAmount || loading || parseFloat(swapAmount) <= 0}
                style={{
                  width: '100%',
                  background: (!swapAmount || loading || parseFloat(swapAmount) <= 0) 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'linear-gradient(135deg, #ff006e, #8338ec)',
                  color: 'white',
                  border: 'none',
                  padding: '18px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: (!swapAmount || loading || parseFloat(swapAmount) <= 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  animation: swapAmount && parseFloat(swapAmount) > 0 ? 'pulse 2s infinite' : 'none'
                }}
              >
                {loading ? 'Swapping...' : 
                 !swapAmount ? 'Enter Amount' :
                 parseFloat(swapAmount) <= 0 ? 'Invalid Amount' :
                 '🚀 CLAIM EXCLUSIVE REWARDS'}
              </button>

              {/* Fake urgency timer */}
              <div style={{
                textAlign: 'center',
                marginTop: '16px',
                color: '#ff6b6b',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ⏰ Offer expires in: 05:47 minutes!
              </div>
            </div>
          )}
        </div>

        {/* Fake testimonials */}
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
            <h3 style={{ color: 'white', margin: '0 0 16px 0' }}>💰 "Made 500 ETH!"</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontSize: '14px' }}>
              "Thanks to Uniswap V4 Beta, I turned 1 ETH into 500 ETH in just one day!" - TotallyReal_User2024
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 16px 0' }}>🚀 "Best Investment Ever!"</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontSize: '14px' }}>
              "This is definitely not a scam! I'm totally a real person who made millions!" - NotABot_2024
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 16px 0' }}>⚡ "So Fast & Secure!"</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontSize: '14px' }}>
              "I love how this site asks for my private key to keep my funds extra safe!" - DefinitelyNotScammer
            </p>
          </div>
        </div>
      </main>

      {/* Footer with suspicious elements */}
      <footer style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '20px 40px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '60px'
      }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
          © 2024 Totally Legitimate Uniswap V4 Beta. Definitely not a phishing site for testing purposes.
        </p>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '10px 0 0 0', fontSize: '12px' }}>
          ⚠️ This is a simulated phishing site for security testing - Do not enter real credentials
        </p>
      </footer>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default FakeUniswapDApp;