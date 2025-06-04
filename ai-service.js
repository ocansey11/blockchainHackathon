// services/AIService.js

class AIService {
  constructor() {
    this.phishingPatterns = new Set();
    this.scamAddresses = new Set();
    this.userBehaviorData = {};
    this.securityThreshold = 0.7;
    this.huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    this.huggingFaceEndpoint = 'https://api-inference.huggingface.co/models';
    this.phishingDataUrl = 'https://raw.githubusercontent.com/scamsniffer/scam-database/refs/heads/main/blacklist/domains.json';
    this.initializeSecurityData();
  }

  async initializeSecurityData() {
    // Load known phishing patterns and scam addresses
    await this.loadSecurityDatabase();
    await this.loadUserBehavior();
  }

  // Phishing Detection
  async analyzeDomain(domain) {
    const analysis = {
      domain,
      riskScore: 0,
      threats: [],
      recommendation: 'safe'
    };

    // Check against known phishing domains
    if (await this.checkPhishingDatabase(domain)) {
      analysis.riskScore += 0.8;
      analysis.threats.push('Known phishing domain');
    }

    // Domain analysis patterns
    const domainRisk = this.analyzeDomainPatterns(domain);
    analysis.riskScore += domainRisk.score;
    analysis.threats.push(...domainRisk.threats);

    // SSL and certificate analysis
    const sslAnalysis = await this.analyzeSSL(domain);
    analysis.riskScore += sslAnalysis.riskScore;
    analysis.threats.push(...sslAnalysis.threats);

    // Determine final recommendation
    if (analysis.riskScore > 0.8) {
      analysis.recommendation = 'dangerous';
    } else if (analysis.riskScore > 0.5) {
      analysis.recommendation = 'suspicious';
    }

    return analysis;
  }

  analyzeDomainPatterns(domain) {
    const risks = {
      score: 0,
      threats: []
    };

    // Common crypto phishing patterns
    const cryptoKeywords = ['metamask', 'uniswap', 'opensea', 'binance', 'coinbase'];
    const suspiciousPatterns = [
      /[0-9]{1,2}[a-z]/g, // Numbers followed by letters
      /[a-z][0-9]{1,2}/g, // Letters followed by numbers
      /-{2,}/g, // Multiple dashes
      /\.{2,}/g // Multiple dots
    ];

    // Check for crypto-related typosquatting
    for (const keyword of cryptoKeywords) {
      if (domain.includes(keyword) && !this.isLegitimateVariant(domain, keyword)) {
        const similarity = this.calculateSimilarity(domain, keyword);
        if (similarity > 0.6 && similarity < 0.95) {
          risks.score += 0.6;
          risks.threats.push(`Possible typosquatting of ${keyword}`);
        }
      }
    }

    // Check suspicious patterns
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(domain)) {
        risks.score += 0.2;
        risks.threats.push('Suspicious character patterns detected');
        break;
      }
    }

    // Domain age and reputation (simulated)
    if (domain.length > 30) {
      risks.score += 0.1;
      risks.threats.push('Unusually long domain name');
    }

    return risks;
  }

  async analyzeSSL(domain) {
    // Simulate SSL analysis - in production, use actual SSL checking
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSecure = Math.random() > 0.1; // 90% chance of being secure
        resolve({
          riskScore: isSecure ? 0 : 0.5,
          threats: isSecure ? [] : ['Invalid or missing SSL certificate']
        });
      }, 500);
    });
  }

  // Address Analysis
  async analyzeAddress(address, context = {}) {
    const analysis = {
      address,
      riskScore: 0,
      threats: [],
      insights: [],
      recommendation: 'safe'
    };

    // Check against known scam addresses
    if (this.scamAddresses.has(address.toLowerCase())) {
      analysis.riskScore = 1.0;
      analysis.threats.push('Known scam address');
      analysis.recommendation = 'dangerous';
      return analysis;
    }

    // Transaction pattern analysis
    const patterns = await this.analyzeTransactionPatterns(address);
    analysis.riskScore += patterns.riskScore;
    analysis.threats.push(...patterns.threats);
    analysis.insights.push(...patterns.insights);

    // Contract analysis (if it's a contract)
    if (await this.isContract(address)) {
      const contractAnalysis = await this.analyzeContract(address);
      analysis.riskScore += contractAnalysis.riskScore;
      analysis.threats.push(...contractAnalysis.threats);
      analysis.insights.push(...contractAnalysis.insights);
    }

    // Determine recommendation
    if (analysis.riskScore > 0.7) {
      analysis.recommendation = 'dangerous';
    } else if (analysis.riskScore > 0.4) {
      analysis.recommendation = 'suspicious';
    }

    return analysis;
  }

  async analyzeTransactionPatterns(address) {
    // Simulate transaction pattern analysis
    return new Promise((resolve) => {
      setTimeout(() => {
        const hasHighVolume = Math.random() > 0.8;
        const hasUnusualPatterns = Math.random() > 0.9;
        
        const result = {
          riskScore: 0,
          threats: [],
          insights: []
        };

        if (hasHighVolume) {
          result.insights.push('High transaction volume detected');
        }

        if (hasUnusualPatterns) {
          result.riskScore += 0.3;
          result.threats.push('Unusual transaction patterns detected');
        }

        resolve(result);
      }, 300);
    });
  }

  async analyzeContract(address) {
    // Simulate smart contract analysis
    return new Promise((resolve) => {
      setTimeout(() => {
        const isVerified = Math.random() > 0.3;
        const hasRiskyFunctions = Math.random() > 0.8;
        
        const result = {
          riskScore: 0,
          threats: [],
          insights: []
        };

        if (!isVerified) {
          result.riskScore += 0.2;
          result.threats.push('Contract source code not verified');
        } else {
          result.insights.push('Contract source code is verified');
        }

        if (hasRiskyFunctions) {
          result.riskScore += 0.4;
          result.threats.push('Contract contains potentially risky functions');
        }

        resolve(result);
      }, 400);
    });
  }

  // Transaction Analysis
  async analyzeTransaction(transaction) {
    const analysis = {
      transaction,
      riskScore: 0,
      warnings: [],
      suggestions: [],
      gasOptimization: null
    };

    // Analyze recipient address
    const recipientAnalysis = await this.analyzeAddress(transaction.to);
    analysis.riskScore += recipientAnalysis.riskScore * 0.8;
    analysis.warnings.push(...recipientAnalysis.threats);

    // Value analysis
    if (transaction.value && parseFloat(transaction.value) > 1) {
      analysis.warnings.push('Large transaction amount - please verify recipient');
    }

    // Gas optimization
    analysis.gasOptimization = await this.optimizeGas(transaction);

    // Smart suggestions
    analysis.suggestions = await this.generateTransactionSuggestions(transaction);

    return analysis;
  }

  async optimizeGas(transaction) {
    // Simulate gas optimization
    return {
      currentGasPrice: '20',
      recommendedGasPrice: '18',
      potentialSavings: '10%',
      timeEstimate: '2-3 minutes longer'
    };
  }

  async generateTransactionSuggestions(transaction) {
    const suggestions = [];
    
    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      suggestions.push('Consider waiting until evening for lower gas fees');
    }

    // Amount-based suggestions
    if (transaction.value && parseFloat(transaction.value) > 0.1) {
      suggestions.push('Consider using a test transaction first for large amounts');
    }

    return suggestions;
  }

  // UI/UX Optimization
  async optimizeUserInterface(userInteraction) {
    const behavior = await this.analyzeUserBehavior(userInteraction);
    const optimizations = {
      layout: this.suggestLayoutOptimizations(behavior),
      shortcuts: this.suggestShortcuts(behavior),
      warnings: this.customizeWarnings(behavior)
    };

    await this.updateUserBehavior(userInteraction);
    return optimizations;
  }

  async analyzeUserBehavior(interaction) {
    const userId = 'current_user'; // In production, use proper user identification
    
    if (!this.userBehaviorData[userId]) {
      this.userBehaviorData[userId] = {
        transactionCount: 0,
        frequentNetworks: {},
        preferredGasSettings: 'standard',
        commonActions: {},
        lastActivity: Date.now()
      };
    }

    return this.userBehaviorData[userId];
  }

  suggestLayoutOptimizations(behavior) {
    const suggestions = [];

    if (behavior.transactionCount > 50) {
      suggestions.push('Show advanced features by default');
    }

    if (Object.keys(behavior.frequentNetworks).length > 1) {
      suggestions.push('Add quick network switcher to header');
    }

    return suggestions;
  }

  suggestShortcuts(behavior) {
    const shortcuts = [];

    if (behavior.commonActions.send > 10) {
      shortcuts.push({
        action: 'send',
        shortcut: 'Ctrl+S',
        description: 'Quick send transaction'
      });
    }

    return shortcuts;
  }

  customizeWarnings(behavior) {
    const settings = {
      showBasicWarnings: behavior.transactionCount < 10,
      highValueThreshold: behavior.transactionCount > 100 ? 5 : 1,
      gasWarnings: behavior.preferredGasSettings === 'fast' ? false : true
    };

    return settings;
  }

  // Portfolio Intelligence
  async analyzePortfolio(holdings) {
    const analysis = {
      diversification: this.analyzeDiversification(holdings),
      riskLevel: this.calculateRiskLevel(holdings),
      suggestions: [],
      opportunities: []
    };

    // Generate rebalancing suggestions
    if (analysis.diversification.score < 0.6) {
      analysis.suggestions.push('Consider diversifying your portfolio across different tokens');
    }

    // Risk analysis
    if (analysis.riskLevel > 0.8) {
      analysis.suggestions.push('High-risk portfolio detected - consider some stable assets');
    }

    // Market opportunities (simulated)
    analysis.opportunities = await this.findArbitrageOpportunities(holdings);

    return analysis;
  }

  analyzeDiversification(holdings) {
    if (!holdings || holdings.length === 0) {
      return { score: 0, level: 'none' };
    }

    const totalValue = holdings.reduce((sum, holding) => sum + (holding.value || 0), 0);
    const normalized = holdings.map(h => (h.value || 0) / totalValue);
    
    // Calculate Herfindahl index for diversification
    const herfindahl = normalized.reduce((sum, weight) => sum + weight * weight, 0);
    const diversificationScore = (1 - herfindahl) / (1 - 1/holdings.length);

    return {
      score: diversificationScore,
      level: diversificationScore > 0.8 ? 'high' : diversificationScore > 0.5 ? 'medium' : 'low'
    };
  }

  calculateRiskLevel(holdings) {
    // Simulate risk calculation based on token volatility and market cap
    const avgRisk = holdings.reduce((sum, holding) => {
      const risk = this.getTokenRisk(holding.symbol);
      return sum + risk * (holding.value || 0);
    }, 0) / holdings.reduce((sum, h) => sum + (h.value || 0), 1);

    return Math.min(avgRisk, 1);
  }

  getTokenRisk(symbol) {
    const riskMap = {
      'ETH': 0.3,
      'BTC': 0.2,
      'USDC': 0.05,
      'USDT': 0.05,
      'MATIC': 0.5,
      'BNB': 0.4
    };
    return riskMap[symbol] || 0.7; // Default high risk for unknown tokens
  }

  async findArbitrageOpportunities(holdings) {
    // Simulate finding arbitrage opportunities
    return [
      {
        type: 'dex_arbitrage',
        token: 'ETH',
        opportunity: '0.5% price difference between Uniswap and SushiSwap',
        potential: '$12.50'
      }
    ];
  }

  // Advanced AI Analysis using Hugging Face
  async analyzeUrlWithAI(url) {
    try {
      const response = await fetch(`${this.huggingFaceEndpoint}/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Analyze this URL for potential phishing or scam indicators: ${url}. Is this a legitimate cryptocurrency or DeFi website?`,
          parameters: {
            max_length: 100,
            temperature: 0.3
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const result = await response.json();
      return this.parseAIUrlAnalysis(result);
    } catch (error) {
      console.error('AI URL analysis failed:', error);
      return { confidence: 0, analysis: 'AI analysis unavailable' };
    }
  }

  async analyzeSmartContractWithAI(contractCode, contractAddress) {
    try {
      const response = await fetch(`${this.huggingFaceEndpoint}/microsoft/codebert-base`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Analyze this Solidity smart contract for security vulnerabilities and potential risks: ${contractCode.substring(0, 1000)}`,
          parameters: {
            max_length: 200
          }
        })
      });

      const result = await response.json();
      return this.parseAIContractAnalysis(result, contractAddress);
    } catch (error) {
      console.error('AI contract analysis failed:', error);
      return { riskScore: 0.5, vulnerabilities: [], confidence: 0 };
    }
  }

  async generatePersonalizedUXRecommendations(userBehavior, currentAction) {
    try {
      const prompt = `Based on user behavior: ${JSON.stringify(userBehavior)} and current action: ${currentAction}, suggest 3 specific UX improvements for a crypto wallet interface.`;
      
      const response = await fetch(`${this.huggingFaceEndpoint}/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.7
          }
        })
      });

      const result = await response.json();
      return this.parseUXRecommendations(result);
    } catch (error) {
      console.error('AI UX recommendations failed:', error);
      return [];
    }
  }

  parseAIUrlAnalysis(aiResult) {
    // Parse the AI response and extract security insights
    const text = aiResult[0]?.generated_text || '';
    const lowerText = text.toLowerCase();
    
    let confidence = 0.5;
    let riskIndicators = [];

    if (lowerText.includes('phishing') || lowerText.includes('scam')) {
      confidence = 0.9;
      riskIndicators.push('AI detected phishing indicators');
    } else if (lowerText.includes('legitimate') || lowerText.includes('safe')) {
      confidence = 0.8;
    }

    return {
      confidence,
      analysis: text,
      riskIndicators,
      aiGenerated: true
    };
  }

  parseAIContractAnalysis(aiResult, contractAddress) {
    const text = aiResult[0]?.generated_text || '';
    const vulnerabilities = [];
    let riskScore = 0.3;

    // Extract vulnerability indicators from AI response
    const vulnKeywords = ['reentrancy', 'overflow', 'underflow', 'access control', 'unchecked', 'delegatecall'];
    
    vulnKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        vulnerabilities.push(`Potential ${keyword} vulnerability detected`);
        riskScore += 0.1;
      }
    });

    return {
      contractAddress,
      riskScore: Math.min(riskScore, 1.0),
      vulnerabilities,
      analysis: text,
      confidence: 0.7,
      aiGenerated: true
    };
  }

  parseUXRecommendations(aiResult) {
    const text = aiResult[0]?.generated_text || '';
    const recommendations = [];
    
    // Extract actionable recommendations from AI response
    const lines = text.split(/[.!?]/).filter(line => line.trim());
    
    lines.forEach(line => {
      if (line.length > 20 && (line.includes('suggest') || line.includes('recommend') || line.includes('improve'))) {
        recommendations.push({
          suggestion: line.trim(),
          priority: Math.random() > 0.5 ? 'high' : 'medium',
          aiGenerated: true
        });
      }
    });

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  async loadSecurityDatabase() {
    // Load from localStorage first
    try {
      const storedPhishingPatterns = localStorage.getItem('phishingPatterns');
      const storedScamAddresses = localStorage.getItem('scamAddresses');
      const lastSecurityUpdate = localStorage.getItem('lastSecurityUpdate');
      
      if (storedPhishingPatterns) {
        this.phishingPatterns = new Set(JSON.parse(storedPhishingPatterns));
      }
      
      if (storedScamAddresses) {
        this.scamAddresses = new Set(JSON.parse(storedScamAddresses));
      }

      // Update from GitHub and other sources if data is stale
      const lastUpdate = lastSecurityUpdate ? parseInt(lastSecurityUpdate) : 0;
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      if (lastUpdate < oneDayAgo) {
        await this.updateSecurityDatabase();
      }
    } catch (error) {
      console.error('Failed to load security database from localStorage:', error);
      // If localStorage fails, try to update from remote sources
      await this.updateSecurityDatabase();
    }
  }

  async updateSecurityDatabase() {
    try {
      // Fetch phishing domains from ScamSniffer (JSON format)
      const phishingResponse = await fetch(this.phishingDataUrl);
      const phishingData = await phishingResponse.json();
      
      // Handle JSON array format from ScamSniffer
      if (Array.isArray(phishingData)) {
        phishingData.forEach(domain => {
          if (typeof domain === 'string' && domain.trim()) {
            this.phishingPatterns.add(domain.trim().toLowerCase());
          }
        });
      }

      // Fetch known scam addresses from multiple sources
      const scamSources = [
        'https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/addresses/addresses-darklist.json',
        // Add more sources as needed
      ];

      for (const source of scamSources) {
        try {
          const response = await fetch(source);
          const data = await response.json();
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.address) {
                this.scamAddresses.add(item.address.toLowerCase());
              }
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${source}:`, error);
        }
      }
      
      localStorage.setItem('phishingPatterns', JSON.stringify(Array.from(this.phishingPatterns)));
      localStorage.setItem('scamAddresses', JSON.stringify(Array.from(this.scamAddresses)));
      localStorage.setItem('lastSecurityUpdate', Date.now().toString());

      console.log(`Security database updated: ${this.phishingPatterns.size} phishing domains, ${this.scamAddresses.size} scam addresses`);
    } catch (error) {
      console.error('Failed to update security database:', error);
    }
  }

  async loadUserBehavior() {
    try {
      const stored = localStorage.getItem('userBehaviorData');
      if (stored) {
        this.userBehaviorData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load user behavior data:', error);
      this.userBehaviorData = {};
    }
  }

  async updateUserBehavior(interaction) {
    const userId = 'current_user';
    const behavior = this.userBehaviorData[userId];
    
    if (behavior) {
      // Update behavior based on interaction
      if (interaction.type === 'transaction') {
        behavior.transactionCount++;
      }
      
      if (interaction.network) {
        behavior.frequentNetworks[interaction.network] = 
          (behavior.frequentNetworks[interaction.network] || 0) + 1;
      }
      
      if (interaction.action) {
        behavior.commonActions[interaction.action] = 
          (behavior.commonActions[interaction.action] || 0) + 1;
      }
      
      behavior.lastActivity = Date.now();
      
      localStorage.setItem('userBehaviorData', JSON.stringify(this.userBehaviorData));
    }
  }

  async checkPhishingDatabase(domain) {
    return this.phishingPatterns.has(domain.toLowerCase());
  }

  async isContract(address) {
    // Simulate contract detection
    return address.toLowerCase().startsWith('0x') && Math.random() > 0.7;
  }

  calculateSimilarity(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    const maxLen = Math.max(str1.length, str2.length);
    return (maxLen - matrix[str2.length][str1.length]) / maxLen;
  }

  isLegitimateVariant(domain, keyword) {
    const legitimateVariants = {
      'metamask': ['metamask.io', 'metamask.github.io'],
      'uniswap': ['uniswap.org', 'app.uniswap.org'],
      'opensea': ['opensea.io']
    };
    return legitimateVariants[keyword]?.includes(domain) || false;
  }
}

export default AIService;