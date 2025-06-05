// test.js - Comprehensive test suite for AIService
import AIService from './ai-service.js';
import dotenv from 'dotenv';

dotenv.config();

// Mock localStorage for Node.js
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

// Mock chrome storage for testing
global.chrome = {
  storage: {
    local: {
      get: async (keys) => ({}),
      set: async (data) => console.log('Chrome Storage Set:', data)
    }
  }
};

// Mock fetch for testing
global.fetch = async (url, options) => {
  console.log(`Mock fetch called: ${url}`);
  
  // Mock responses for different URLs
  if (url.includes('domains.json')) {
    return {
      ok: true,
      json: async () => [
        'example-phishing-site.com',
        'fake-metamask.io',
        'scam-uniswap.org',
        'phishing-opensea.com',
        'malicious-binance.net'
      ]
    };
  }
  
  if (url.includes('addresses-darklist.json')) {
    return {
      ok: true,
      json: async () => [
        { address: '0x1234567890123456789012345678901234567890', reason: 'Phishing' },
        { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', reason: 'Scam' }
      ]
    };
  }
  
  if (url.includes('huggingface.co')) {
    return {
      ok: true,
      json: async () => [{
        generated_text: 'This appears to be a legitimate cryptocurrency website with proper security measures.'
      }]
    };
  }
  
  return {
    ok: true,
    json: async () => ([])
  };
};

async function runTests() {
  console.log('🚀 Starting AIService Tests...\n');
  
  const aiService = new AIService();
  
  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 1: Domain Analysis
  console.log('📊 Test 1: Domain Analysis');
  console.log('=' .repeat(50));
  
  const domains = [
    'metamask.io',
    'fake-metamask.io',
    'uniswap.org',
    'scam-uniswap.org',
    'totally-legit-crypto-site-with-very-long-name.com'
  ];
  
  for (const domain of domains) {
    try {
      const analysis = await aiService.analyzeDomain(domain);
      console.log(`\nDomain: ${domain}`);
      console.log(`Risk Score: ${analysis.riskScore.toFixed(2)}`);
      console.log(`Recommendation: ${analysis.recommendation}`);
      console.log(`Threats: ${analysis.threats.join(', ') || 'None'}`);
    } catch (error) {
      console.error(`Error analyzing ${domain}:`, error.message);
    }
  }
  
  // Test 2: Address Analysis
  console.log('\n\n📊 Test 2: Address Analysis');
  console.log('=' .repeat(50));
  
  const addresses = [
    '0x742d35Cc6634C0532925a3b8D69161B12345678a',
    '0xA0b86991C426C6CC6CcC6Cc6Cc6cc6cc6cC6CC6cC', // USDC contract
    '0x1234567890123456789012345678901234567890'
  ];
  
  for (const address of addresses) {
    try {
      const analysis = await aiService.analyzeAddress(address);
      console.log(`\nAddress: ${address.substring(0, 10)}...`);
      console.log(`Risk Score: ${analysis.riskScore.toFixed(2)}`);
      console.log(`Recommendation: ${analysis.recommendation}`);
      console.log(`Threats: ${analysis.threats.join(', ') || 'None'}`);
      console.log(`Insights: ${analysis.insights.join(', ') || 'None'}`);
    } catch (error) {
      console.error(`Error analyzing address:`, error.message);
    }
  }
  
  // Test 3: Transaction Analysis
  console.log('\n\n📊 Test 3: Transaction Analysis');
  console.log('=' .repeat(50));
  
  const transactions = [
    {
      to: '0x742d35Cc6634C0532925a3b8D69161B12345678a',
      value: '0.5',
      gasPrice: '20'
    },
    {
      to: '0xA0b86991C426C6CC6CcC6Cc6Cc6cc6cc6cC6CC6cC',
      value: '2.5',
      gasPrice: '25'
    }
  ];
  
  for (const tx of transactions) {
    try {
      const analysis = await aiService.analyzeTransaction(tx);
      console.log(`\nTransaction to: ${tx.to.substring(0, 10)}...`);
      console.log(`Risk Score: ${analysis.riskScore.toFixed(2)}`);
      console.log(`Warnings: ${analysis.warnings.join(', ') || 'None'}`);
      console.log(`Gas Optimization: Current ${analysis.gasOptimization.currentGasPrice} → Recommended ${analysis.gasOptimization.recommendedGasPrice}`);
      console.log(`Suggestions: ${analysis.suggestions.join(', ') || 'None'}`);
    } catch (error) {
      console.error(`Error analyzing transaction:`, error.message);
    }
  }
  
  // Test 4: Portfolio Analysis
  console.log('\n\n📊 Test 4: Portfolio Analysis');
  console.log('=' .repeat(50));
  
  const portfolios = [
    // Diversified portfolio
    [
      { symbol: 'ETH', value: 1000 },
      { symbol: 'BTC', value: 800 },
      { symbol: 'USDC', value: 500 },
      { symbol: 'MATIC', value: 200 }
    ],
    // Risky portfolio
    [
      { symbol: 'UNKNOWN_TOKEN', value: 2000 },
      { symbol: 'RISKY_ALTCOIN', value: 500 }
    ]
  ];
  
  for (let i = 0; i < portfolios.length; i++) {
    try {
      const analysis = await aiService.analyzePortfolio(portfolios[i]);
      console.log(`\nPortfolio ${i + 1}:`);
      console.log(`Diversification: ${analysis.diversification.level} (${analysis.diversification.score.toFixed(2)})`);
      console.log(`Risk Level: ${analysis.riskLevel.toFixed(2)}`);
      console.log(`Suggestions: ${analysis.suggestions.join(', ') || 'None'}`);
      console.log(`Opportunities: ${analysis.opportunities.map(o => o.opportunity).join(', ') || 'None'}`);
    } catch (error) {
      console.error(`Error analyzing portfolio:`, error.message);
    }
  }
  
  // Test 5: AI Analysis (if API key is available)
  console.log('\n\n📊 Test 5: AI Analysis');
  console.log('=' .repeat(50));
  
  if (process.env.HUGGING_FACE_API_KEY) {
    try {
      const urlAnalysis = await aiService.analyzeUrlWithAI('https://suspicious-crypto-site.com');
      console.log('\nAI URL Analysis:');
      console.log(`Confidence: ${urlAnalysis.confidence}`);
      console.log(`Analysis: ${urlAnalysis.analysis}`);
      console.log(`Risk Indicators: ${urlAnalysis.riskIndicators?.join(', ') || 'None'}`);
    } catch (error) {
      console.error('AI URL analysis failed:', error.message);
    }
    
    try {
      const contractAnalysis = await aiService.analyzeSmartContractWithAI(
        'contract MyToken { function transfer() public {} }',
        '0x1234567890123456789012345678901234567890'
      );
      console.log('\nAI Contract Analysis:');
      console.log(`Risk Score: ${contractAnalysis.riskScore}`);
      console.log(`Vulnerabilities: ${contractAnalysis.vulnerabilities.join(', ') || 'None'}`);
      console.log(`Confidence: ${contractAnalysis.confidence}`);
    } catch (error) {
      console.error('AI contract analysis failed:', error.message);
    }
  } else {
    console.log('\nSkipping AI tests - No API key found');
  }
  
  // Test 6: User Behavior Analysis
  console.log('\n\n📊 Test 6: User Behavior Analysis');
  console.log('=' .repeat(50));
  
  const userInteraction = {
    type: 'transaction',
    action: 'send',
    network: 'ethereum',
    timestamp: Date.now()
  };
  
  try {
    const uxOptimizations = await aiService.optimizeUserInterface(userInteraction);
    console.log('\nUX Optimizations:');
    console.log(`Layout suggestions: ${uxOptimizations.layout.join(', ') || 'None'}`);
    console.log(`Shortcuts: ${uxOptimizations.shortcuts.map(s => `${s.action}: ${s.shortcut}`).join(', ') || 'None'}`);
    console.log(`Warning settings:`, uxOptimizations.warnings);
  } catch (error) {
    console.error('UX optimization failed:', error.message);
  }
  
  // Test 7: Similarity Algorithm
  console.log('\n\n📊 Test 7: Similarity Algorithm');
  console.log('=' .repeat(50));
  
  const similarityTests = [
    ['metamask', 'metamask'],
    ['metamask', 'metamask.io'],
    ['metamask', 'metmask'],
    ['metamask', 'metamsk'],
    ['uniswap', 'uniswp'],
    ['opensea', 'opensae']
  ];
  
  similarityTests.forEach(([str1, str2]) => {
    const similarity = aiService.calculateSimilarity(str1, str2);
    console.log(`Similarity between "${str1}" and "${str2}": ${similarity.toFixed(3)}`);
  });
  
  console.log('\n✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error);
