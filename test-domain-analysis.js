// test-domain-analysis.js - Focused testing for domain analysis features
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
      get: async (keys) => ({}),
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
  return { ok: true, json: async () => ([]) };
};

async function testDomainAnalysis() {
  console.log('🔍 Domain Analysis Test Suite');
  console.log('=' .repeat(60));
  
  const aiService = new AIService();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const testCases = [
    {
      category: 'Legitimate Sites',
      domains: [
        'metamask.io',
        'uniswap.org',
        'opensea.io',
        'ethereum.org',
        'coinbase.com'
      ]
    },
    {
      category: 'Suspicious Typosquatting',
      domains: [
        'metmask.io',
        'metamsk.io', 
        'uniswaap.org',
        'uniswp.org',
        'opensae.io',
        'binannce.com'
      ]
    },
    {
      category: 'Clearly Malicious',
      domains: [
        'fake-metamask.io',
        'scam-uniswap.org',
        'phishing-opensea.com',
        'get-free-crypto-now.com',
        'metamask-security-update-required.net'
      ]
    },
    {
      category: 'Suspicious Patterns',
      domains: [
        'meta-mask123.com',
        'uni5swap.org',
        'opensea--nft.io',
        'www..metamask.com',
        'super-long-crypto-domain-name-that-looks-suspicious.com'
      ]
    }
  ];
  
  for (const testCategory of testCases) {
    console.log(`\n📋 ${testCategory.category}`);
    console.log('-' .repeat(40));
    
    for (const domain of testCategory.domains) {
      try {
        const analysis = await aiService.analyzeDomain(domain);
        
        console.log(`\n🌐 ${domain}`);
        console.log(`   Risk Score: ${analysis.riskScore.toFixed(3)} ${getRiskEmoji(analysis.riskScore)}`);
        console.log(`   Status: ${analysis.recommendation.toUpperCase()} ${getStatusEmoji(analysis.recommendation)}`);
        
        if (analysis.threats.length > 0) {
          console.log(`   Threats:`);
          analysis.threats.forEach(threat => {
            console.log(`     ⚠️  ${threat}`);
          });
        }
        
        // Test similarity with known crypto brands
        const cryptoBrands = ['metamask', 'uniswap', 'opensea', 'binance', 'coinbase'];
        const similarities = cryptoBrands.map(brand => ({
          brand,
          similarity: aiService.calculateSimilarity(domain.replace(/\.[^.]+$/, ''), brand)
        })).filter(s => s.similarity > 0.6);
        
        if (similarities.length > 0) {
          console.log(`   Similar to:`);
          similarities.forEach(s => {
            console.log(`     🔗 ${s.brand} (${(s.similarity * 100).toFixed(1)}% similar)`);
          });
        }
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
  }
  
  // Test SSL Analysis
  console.log(`\n\n🔒 SSL Analysis Test`);
  console.log('-' .repeat(40));
  
  const sslTestDomains = ['example.com', 'test-ssl.com', 'insecure-site.net'];
  
  for (const domain of sslTestDomains) {
    try {
      const sslResult = await aiService.analyzeSSL(domain);
      console.log(`\n🌐 ${domain}`);
      console.log(`   SSL Risk Score: ${sslResult.riskScore}`);
      console.log(`   SSL Issues: ${sslResult.threats.join(', ') || 'None'}`);
    } catch (error) {
      console.error(`   ❌ SSL Error: ${error.message}`);
    }
  }
  
  // Performance Test
  console.log(`\n\n⚡ Performance Test`);
  console.log('-' .repeat(40));
  
  const perfTestDomains = Array.from({length: 10}, (_, i) => `test-domain-${i}.com`);
  const startTime = Date.now();
  
  const results = await Promise.all(
    perfTestDomains.map(domain => aiService.analyzeDomain(domain))
  );
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / perfTestDomains.length;
  
  console.log(`\n📊 Performance Results:`);
  console.log(`   Total time: ${endTime - startTime}ms`);
  console.log(`   Average per domain: ${avgTime.toFixed(2)}ms`);
  console.log(`   Domains processed: ${results.length}`);
  
  console.log('\n✅ Domain analysis tests completed!');
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

testDomainAnalysis().catch(console.error);
