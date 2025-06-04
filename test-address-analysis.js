// test-address-analysis.js - Focused testing for address and contract analysis
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

// Mock chrome storage and fetch
global.chrome = {
  storage: {
    local: {
      get: async (keys) => ({
        scamAddresses: [
          '0x1234567890123456789012345678901234567890',
          '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
        ]
      }),
      set: async (data) => console.log('Chrome Storage Set:', data)
    }
  }
};

global.fetch = async (url, options) => {
  if (url.includes('domains.json')) {
    return {
      ok: true,
      json: async () => [
        'fake-metamask.io',
        'scam-uniswap.org',
        'phishing-opensea.com',
        'malicious-binance.net',
        'fake-coinbase.co'
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
        generated_text: 'Contract analysis shows potential reentrancy vulnerability and unchecked external calls.'
      }]
    };
  }
  
  return { ok: true, json: async () => ([]) };
};

async function testAddressAnalysis() {
  console.log('🔍 Address & Contract Analysis Test Suite');
  console.log('=' .repeat(60));
  
  const aiService = new AIService();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test Cases for Address Analysis
  const addressTestCases = [
    {
      category: 'Known Scam Addresses',
      addresses: [
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      ]
    },
    {
      category: 'Legitimate Contract Addresses',
      addresses: [
        '0xA0b86991C426C6CC6CcC6Cc6Cc6cc6cc6cC6CC6cC', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
      ]
    },
    {
      category: 'Random Addresses',
      addresses: [
        '0x742d35Cc6634C0532925a3b8D69161B12345678a',
        '0x8ba1f109551bD432803012645Hac136c3c5d3d85',
        '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'
      ]
    },
    {
      category: 'Invalid Addresses',
      addresses: [
        '0x123', // Too short
        'not-an-address',
        '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG' // Invalid hex
      ]
    }
  ];
  
  for (const testCategory of addressTestCases) {
    console.log(`\n📋 ${testCategory.category}`);
    console.log('-' .repeat(40));
    
    for (const address of testCategory.addresses) {
      try {
        console.log(`\n🏦 ${address.substring(0, 10)}...${address.substring(address.length - 8)}`);
        
        const analysis = await aiService.analyzeAddress(address);
        
        console.log(`   Risk Score: ${analysis.riskScore.toFixed(3)} ${getRiskEmoji(analysis.riskScore)}`);
        console.log(`   Status: ${analysis.recommendation.toUpperCase()} ${getStatusEmoji(analysis.recommendation)}`);
        
        if (analysis.threats.length > 0) {
          console.log(`   Threats:`);
          analysis.threats.forEach(threat => {
            console.log(`     ⚠️  ${threat}`);
          });
        }
        
        if (analysis.insights.length > 0) {
          console.log(`   Insights:`);
          analysis.insights.forEach(insight => {
            console.log(`     💡 ${insight}`);
          });
        }
        
        // Check if it's detected as a contract
        const isContract = await aiService.isContract(address);
        console.log(`   Contract: ${isContract ? '✅ Yes' : '❌ No'}`);
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
  }
  
  // Contract Analysis Test
  console.log(`\n\n📄 Smart Contract Analysis Test`);
  console.log('-' .repeat(40));
  
  const contractTestCases = [
    {
      name: 'Simple Token Contract',
      code: `
        pragma solidity ^0.8.0;
        contract SimpleToken {
          mapping(address => uint256) public balances;
          function transfer(address to, uint256 amount) public {
            balances[msg.sender] -= amount;
            balances[to] += amount;
          }
        }
      `,
      address: '0x742d35Cc6634C0532925a3b8D69161B12345678a'
    },
    {
      name: 'Potentially Risky Contract',
      code: `
        pragma solidity ^0.8.0;
        contract RiskyContract {
          function delegateCall(address target, bytes memory data) public {
            target.delegatecall(data);
          }
          function withdraw() public {
            msg.sender.call{value: address(this).balance}("");
          }
        }
      `,
      address: '0x1234567890123456789012345678901234567890'
    }
  ];
  
  if (process.env.HUGGING_FACE_API_KEY) {
    for (const testCase of contractTestCases) {
      try {
        console.log(`\n📄 ${testCase.name}`);
        console.log(`   Address: ${testCase.address}`);
        
        const contractAnalysis = await aiService.analyzeSmartContractWithAI(
          testCase.code,
          testCase.address
        );
        
        console.log(`   AI Risk Score: ${contractAnalysis.riskScore.toFixed(3)}`);
        console.log(`   Confidence: ${contractAnalysis.confidence.toFixed(3)}`);
        
        if (contractAnalysis.vulnerabilities.length > 0) {
          console.log(`   Vulnerabilities:`);
          contractAnalysis.vulnerabilities.forEach(vuln => {
            console.log(`     🚨 ${vuln}`);
          });
        }
        
        console.log(`   AI Analysis: ${contractAnalysis.analysis.substring(0, 100)}...`);
        
      } catch (error) {
        console.error(`   ❌ Contract Analysis Error: ${error.message}`);
      }
    }
  } else {
    console.log('\n⚠️  Skipping AI contract analysis - No API key found');
  }
  
  // Transaction Pattern Analysis Test
  console.log(`\n\n📊 Transaction Pattern Analysis Test`);
  console.log('-' .repeat(40));
  
  const testAddresses = [
    '0x742d35Cc6634C0532925a3b8D69161B12345678a',
    '0xA0b86991C426C6CC6CcC6Cc6Cc6cc6cc6cC6CC6cC'
  ];
  
  for (const address of testAddresses) {
    try {
      console.log(`\n📊 ${address.substring(0, 10)}...`);
      
      const patterns = await aiService.analyzeTransactionPatterns(address);
      
      console.log(`   Pattern Risk Score: ${patterns.riskScore.toFixed(3)}`);
      
      if (patterns.threats.length > 0) {
        console.log(`   Pattern Threats:`);
        patterns.threats.forEach(threat => {
          console.log(`     ⚠️  ${threat}`);
        });
      }
      
      if (patterns.insights.length > 0) {
        console.log(`   Pattern Insights:`);
        patterns.insights.forEach(insight => {
          console.log(`     💡 ${insight}`);
        });
      }
      
    } catch (error) {
      console.error(`   ❌ Pattern Analysis Error: ${error.message}`);
    }
  }
  
  // Performance Test for Address Analysis
  console.log(`\n\n⚡ Address Analysis Performance Test`);
  console.log('-' .repeat(40));
  
  const perfTestAddresses = Array.from({length: 5}, (_, i) => 
    `0x${i.toString().padStart(40, '0')}${Math.random().toString(16).substring(2, 10)}`
  );
  
  const startTime = Date.now();
  
  const results = await Promise.all(
    perfTestAddresses.map(address => aiService.analyzeAddress(address))
  );
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / perfTestAddresses.length;
  
  console.log(`\n📊 Performance Results:`);
  console.log(`   Total time: ${endTime - startTime}ms`);
  console.log(`   Average per address: ${avgTime.toFixed(2)}ms`);
  console.log(`   Addresses processed: ${results.length}`);
  
  console.log('\n✅ Address analysis tests completed!');
}

function getRiskEmoji(riskScore) {
  if (riskScore >= 0.8) return '🔴';
  if (riskScore >= 0.5) return '🟡';
  return '🟢';
}

function getStatusEmoji(recommendation) {
  switch (recommendation) {
    case 'dangerous': return '❌';
    case 'suspicious': return '⚠️';
    case 'safe': return '✅';
    default: return '❓';
  }
}

testAddressAnalysis().catch(console.error);
