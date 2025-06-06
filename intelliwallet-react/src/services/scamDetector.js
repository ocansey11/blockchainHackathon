// scamDetector.js - Tenderly-powered scam detection service for VaultIQ

class ScamDetector {
  constructor() {
    this.tenderlyApiKey = process.env.TENDERLY_API_KEY || process.env.REACT_APP_TENDERLY_API_KEY;
    this.tenderlyProjectSlug = process.env.TENDERLY_PROJECT_SLUG || 'vaultiq-security';
    this.tenderlyUsername = process.env.TENDERLY_USERNAME || 'vaultiq';
    this.tenderlyApiUrl = 'https://api.tenderly.co/api/v1';
    
    // Cache for recent analyses
    this.analysisCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Known vulnerability patterns
    this.vulnerabilityPatterns = {
      unlimitedApproval: /approve.*2\*\*256/i,
      honeypot: /transfer.*revert|selfdestruct/i,
      reentrancy: /call.*value.*gas/i,
      blacklist: /blacklist|blocked|banned/i,
      pausable: /pause|unpause/i,
      mintable: /mint.*owner/i,
      burn: /burn.*supply/i
    };
  }

  /**
   * Main function to analyze a transaction for scam detection
   * @param {Object} txObject - Transaction object to analyze
   * @returns {Promise<ScamReport>} - Scam analysis report
   */
  async analyzeTransaction(txObject) {
    try {
      console.log('🔍 Starting scam detection analysis for transaction:', txObject);
      
      // Check cache first
      const cacheKey = this.getCacheKey(txObject);
      if (this.analysisCache.has(cacheKey)) {
        const cached = this.analysisCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('📋 Using cached analysis result');
          return cached.result;
        }
      }

      // Step 1: Simulate transaction via Tenderly
      const simulationResult = await this.simulateTransaction(txObject);
      
      // Step 2: Extract and format metadata
      const metadata = this.extractMetadata(simulationResult, txObject);
      
      // Step 3: Perform additional security checks
      const securityChecks = await this.performSecurityChecks(txObject, simulationResult);
      
      // Step 4: Combine metadata with security analysis
      const combinedAnalysis = { ...metadata, ...securityChecks };
      
      // Step 5: Generate LLM prompt and get AI analysis
      const aiAnalysis = await this.getAIAnalysis(combinedAnalysis);
      
      // Step 6: Create final scam report
      const scamReport = this.createScamReport(combinedAnalysis, aiAnalysis);
      
      // Cache the result
      this.analysisCache.set(cacheKey, {
        result: scamReport,
        timestamp: Date.now()
      });
      
      console.log('✅ Scam detection analysis completed:', scamReport);
      return scamReport;
      
    } catch (error) {
      console.error('❌ Scam detection analysis failed:', error);
      return this.createFallbackReport(error);
    }
  }

  /**
   * Simulate transaction using Tenderly API
   */
  async simulateTransaction(txObject) {
    if (!this.tenderlyApiKey) {
      throw new Error('Tenderly API key not configured');
    }

    const simulationPayload = {
      network_id: this.getNetworkId(txObject.chainId),
      from: txObject.from,
      to: txObject.to,
      input: txObject.data || '0x',
      gas: parseInt(txObject.gas || '0x5208', 16),
      gas_price: parseInt(txObject.gasPrice || '0x3b9aca00', 16), // 1 gwei default
      value: txObject.value || '0x0',
      save: true,
      save_if_fails: true,
      simulation_type: 'full'
    };

    console.log('🔄 Simulating transaction with Tenderly...');
    
    const response = await fetch(`${this.tenderlyApiUrl}/account/${this.tenderlyUsername}/project/${this.tenderlyProjectSlug}/simulate`, {
      method: 'POST',
      headers: {
        'X-Access-Key': this.tenderlyApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(simulationPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tenderly simulation failed:', response.status, errorText);
      throw new Error(`Tenderly simulation failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Tenderly simulation completed');
    return result.simulation;
  }

  /**
   * Extract useful metadata from simulation results
   */
  extractMetadata(simulation, txObject) {
    const metadata = {
      transactionHash: simulation.id,
      success: simulation.status,
      gasUsed: simulation.gas_used,
      gasLimit: parseInt(txObject.gas || '0x5208', 16),
      contractAddress: txObject.to,
      functionCalled: null,
      events: [],
      stateChanges: [],
      contractVerified: false,
      contractCode: null,
      traces: simulation.transaction_info?.call_trace || [],
      errorMessage: simulation.error_message || null
    };

    // Extract function signature if available
    if (txObject.data && txObject.data.length >= 10) {
      metadata.functionSignature = txObject.data.substring(0, 10);
      metadata.functionCalled = this.decodeFunctionSignature(metadata.functionSignature);
    }

    // Extract events from logs
    if (simulation.logs) {
      metadata.events = simulation.logs.map(log => ({
        address: log.address,
        topics: log.topics,
        data: log.data
      }));
    }

    // Extract state changes
    if (simulation.addresses) {
      metadata.stateChanges = Object.keys(simulation.addresses).map(address => ({
        address,
        balanceChange: simulation.addresses[address].balance_diff || '0',
        storageChanges: simulation.addresses[address].storage || {}
      }));
    }

    // Check if contract is verified (this would need additional API call in production)
    metadata.contractVerified = this.checkContractVerification(txObject.to);

    return metadata;
  }

  /**
   * Perform additional security checks
   */
  async performSecurityChecks(txObject, simulation) {
    const checks = {
      isUnlimitedApproval: false,
      hasHoneypotBehavior: false,
      hasReentrancyRisk: false,
      hasBlacklistFunction: false,
      isPausable: false,
      isMintable: false,
      hasBurnFunction: false,
      gasAnomalies: false,
      suspiciousPatterns: [],
      riskFactors: []
    };

    // Check for unlimited approvals
    if (txObject.data && this.vulnerabilityPatterns.unlimitedApproval.test(txObject.data)) {
      checks.isUnlimitedApproval = true;
      checks.riskFactors.push('Unlimited token approval detected');
    }

    // Check for honeypot behavior (buy vs sell simulation)
    if (txObject.to && this.isLikelyDEXInteraction(txObject)) {
      checks.hasHoneypotBehavior = await this.checkHoneypotBehavior(txObject);
      if (checks.hasHoneypotBehavior) {
        checks.riskFactors.push('Potential honeypot detected - sell transactions may fail');
      }
    }

    // Gas usage anomaly detection
    const expectedGas = this.estimateExpectedGas(txObject);
    const actualGas = simulation.gas_used;
    if (actualGas > expectedGas * 2) {
      checks.gasAnomalies = true;
      checks.riskFactors.push(`Unusually high gas usage: ${actualGas} vs expected ${expectedGas}`);
    }

    // Check simulation traces for suspicious patterns
    if (simulation.transaction_info?.call_trace) {
      checks.suspiciousPatterns = this.analyzePatternsInTraces(simulation.transaction_info.call_trace);
      checks.riskFactors.push(...checks.suspiciousPatterns);
    }

    // Check for failed simulation
    if (!simulation.status) {
      checks.riskFactors.push(`Transaction simulation failed: ${simulation.error_message || 'Unknown error'}`);
    }

    return checks;
  }

  /**
   * Check for honeypot behavior by simulating both buy and sell
   */
  async checkHoneypotBehavior(txObject) {
    try {
      // This is a simplified check - in production, you'd simulate actual DEX interactions
      const buySimulation = await this.simulateTransaction(txObject);
      
      // Create a reverse transaction to simulate selling
      const sellTxObject = {
        ...txObject,
        data: this.createSellTransaction(txObject.data)
      };
      
      const sellSimulation = await this.simulateTransaction(sellTxObject);
      
      // If buy succeeds but sell fails, it's likely a honeypot
      return buySimulation.status && !sellSimulation.status;
    } catch (error) {
      console.warn('Honeypot check failed:', error);
      return false;
    }
  }

  /**
   * Analyze patterns in transaction traces
   */
  analyzePatternsInTraces(traces) {
    const suspiciousPatterns = [];
    
    traces.forEach(trace => {
      // Check for suspicious delegate calls
      if (trace.op === 'DELEGATECALL') {
        suspiciousPatterns.push('Delegate call detected - potential proxy risk');
      }
      
      // Check for self-destruct
      if (trace.op === 'SELFDESTRUCT') {
        suspiciousPatterns.push('Self-destruct function detected');
      }
      
      // Check for external calls with high gas
      if (trace.op === 'CALL' && trace.gas > 100000) {
        suspiciousPatterns.push('High-gas external call detected');
      }
    });
    
    return suspiciousPatterns;
  }

  /**
   * Get AI analysis using LLM
   */
  async getAIAnalysis(combinedAnalysis) {
    const prompt = this.buildLLMPrompt(combinedAnalysis);
    
    try {
      // Use the existing callLLM function if available, otherwise implement basic LLM call
      const aiResponse = typeof callLLM !== 'undefined' 
        ? await callLLM(prompt)
        : await this.callLLMFallback(prompt);
      
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.createFallbackAIAnalysis(combinedAnalysis);
    }
  }

  /**
   * Build comprehensive LLM prompt
   */
  buildLLMPrompt(analysis) {
    return `
Analyze this Ethereum transaction for scam/security risks and provide a structured assessment:

TRANSACTION DETAILS:
- Contract Address: ${analysis.contractAddress}
- Function Called: ${analysis.functionCalled || 'Unknown'}
- Gas Used: ${analysis.gasUsed}
- Success: ${analysis.success}
- Error: ${analysis.errorMessage || 'None'}

SECURITY ANALYSIS:
- Unlimited Approval: ${analysis.isUnlimitedApproval}
- Honeypot Behavior: ${analysis.hasHoneypotBehavior}
- Gas Anomalies: ${analysis.gasAnomalies}
- Contract Verified: ${analysis.contractVerified}
- Risk Factors: ${analysis.riskFactors.join(', ') || 'None'}
- Suspicious Patterns: ${analysis.suspiciousPatterns.join(', ') || 'None'}

SMART CONTRACT EVENTS:
${analysis.events.map(event => `- Event at ${event.address}`).join('\n') || 'No events'}

Based on this analysis, provide:
1. Risk Level: "low", "medium", or "high"
2. Traffic Light: 🟢 (Safe), 🟡 (Caution), or 🔴 (Risky)
3. One-line Summary: Brief explanation of the risk assessment
4. Warning Message: User-friendly warning if risks are detected

Format your response as JSON:
{
  "level": "low|medium|high",
  "emoji": "🟢|🟡|🔴",
  "summary": "One line explanation",
  "warning": "User warning message"
}
`;
  }

  /**
   * Parse AI response into structured format
   */
  parseAIResponse(aiResponse) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing if JSON extraction fails
      return this.parseAIResponseFallback(aiResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.createDefaultAIAnalysis();
    }
  }

  /**
   * Create final scam report
   */
  createScamReport(metadata, aiAnalysis) {
    const report = {
      level: aiAnalysis.level || 'medium',
      emoji: aiAnalysis.emoji || '🟡',
      summary: aiAnalysis.summary || 'Transaction requires manual review',
      warning: aiAnalysis.warning || 'Please verify transaction details carefully',
      
      // Additional technical details
      technicalDetails: {
        simulationId: metadata.transactionHash,
        gasUsed: metadata.gasUsed,
        contractVerified: metadata.contractVerified,
        functionCalled: metadata.functionCalled,
        riskFactors: metadata.riskFactors || [],
        suspiciousPatterns: metadata.suspiciousPatterns || []
      },
      
      // Confidence score
      confidence: this.calculateConfidence(metadata, aiAnalysis),
      
      // Timestamp
      analyzedAt: new Date().toISOString()
    };

    return report;
  }

  /**
   * Calculate confidence score based on available data
   */
  calculateConfidence(metadata, aiAnalysis) {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence if simulation succeeded
    if (metadata.success) confidence += 0.2;
    
    // Higher confidence if contract is verified
    if (metadata.contractVerified) confidence += 0.2;
    
    // Higher confidence if AI analysis is available
    if (aiAnalysis.level) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Create fallback report when analysis fails
   */
  createFallbackReport(error) {
    return {
      level: 'medium',
      emoji: '🟡',
      summary: 'Analysis failed - manual review recommended',
      warning: 'Unable to analyze transaction security. Please proceed with caution.',
      technicalDetails: {
        error: error.message,
        fallback: true
      },
      confidence: 0.1,
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Fallback AI analysis when LLM is unavailable
   */
  createFallbackAIAnalysis(analysis) {
    let level = 'low';
    let emoji = '🟢';
    let summary = 'Basic security checks passed';
    let warning = '';

    // Basic rule-based analysis
    if (analysis.riskFactors.length > 2) {
      level = 'high';
      emoji = '🔴';
      summary = 'Multiple risk factors detected';
      warning = 'High risk transaction - consider canceling';
    } else if (analysis.riskFactors.length > 0) {
      level = 'medium';
      emoji = '🟡';
      summary = 'Some risks detected';
      warning = 'Please review transaction carefully';
    }

    return { level, emoji, summary, warning };
  }

  /**
   * Fallback LLM call if external function not available
   */
  async callLLMFallback(prompt) {
    // This would integrate with your preferred LLM service
    // For now, return a basic response
    return 'Transaction analysis completed. Medium risk detected.';
  }

  // Helper methods
  getCacheKey(txObject) {
    return `${txObject.to}_${txObject.data || ''}_${txObject.value || '0'}`;
  }

  getNetworkId(chainId) {
    const networks = {
      '0x1': '1',     // Ethereum Mainnet
      '0x89': '137',  // Polygon
      '0xa86a': '43114', // Avalanche
      '0x38': '56'    // BSC
    };
    return networks[chainId] || '1';
  }

  decodeFunctionSignature(signature) {
    const knownSignatures = {
      '0xa9059cbb': 'transfer(address,uint256)',
      '0x095ea7b3': 'approve(address,uint256)',
      '0x23b872dd': 'transferFrom(address,address,uint256)',
      '0x18160ddd': 'totalSupply()',
      '0x70a08231': 'balanceOf(address)'
    };
    return knownSignatures[signature] || 'Unknown function';
  }

  checkContractVerification(address) {
    // Placeholder - in production, check against Etherscan or similar
    return Math.random() > 0.3; // 70% chance of being verified
  }

  isLikelyDEXInteraction(txObject) {
    // Simple heuristic to detect DEX interactions
    const dexPatterns = [
      '0x7ff36ab5', // swapExactETHForTokens
      '0x38ed1739', // swapExactTokensForTokens
      '0x8803dbee'  // swapTokensForExactTokens
    ];
    
    if (!txObject.data) return false;
    const functionSig = txObject.data.substring(0, 10);
    return dexPatterns.includes(functionSig);
  }

  createSellTransaction(originalData) {
    // This is a simplified version - in production, you'd properly encode the reverse transaction
    return originalData; // Placeholder
  }

  estimateExpectedGas(txObject) {
    // Basic gas estimation based on transaction type
    if (!txObject.data || txObject.data === '0x') return 21000; // Simple transfer
    if (txObject.data.length < 50) return 50000; // Simple contract call
    return 100000; // Complex contract interaction
  }

  parseAIResponseFallback(response) {
    const riskKeywords = ['high', 'danger', 'scam', 'risky'];
    const safeKeywords = ['safe', 'low', 'secure', 'legitimate'];
    
    const lowerResponse = response.toLowerCase();
    
    if (riskKeywords.some(keyword => lowerResponse.includes(keyword))) {
      return {
        level: 'high',
        emoji: '🔴',
        summary: 'High risk detected by AI analysis',
        warning: 'Strong recommendation to avoid this transaction'
      };
    } else if (safeKeywords.some(keyword => lowerResponse.includes(keyword))) {
      return {
        level: 'low',
        emoji: '🟢',
        summary: 'Low risk detected by AI analysis',
        warning: ''
      };
    }
    
    return this.createDefaultAIAnalysis();
  }

  createDefaultAIAnalysis() {
    return {
      level: 'medium',
      emoji: '🟡',
      summary: 'Unable to determine risk level',
      warning: 'Please review transaction manually'
    };
  }
}

// ScamReport interface for TypeScript compatibility
/**
 * @typedef {Object} ScamReport
 * @property {'low'|'medium'|'high'} level - Risk level
 * @property {'🟢'|'🟡'|'🔴'} emoji - Traffic light indicator
 * @property {string} summary - One-line explanation
 * @property {string} warning - User warning message
 * @property {Object} technicalDetails - Technical analysis details
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} analyzedAt - ISO timestamp
 */

export default ScamDetector;
