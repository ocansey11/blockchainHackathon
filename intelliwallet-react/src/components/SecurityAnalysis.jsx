// SecurityAnalysis.jsx - Enhanced security analysis component with Tenderly integration
import React, { useState, useEffect } from 'react';
import RiskBadge from './RiskBadge';
import ScamDetector from '../services/scamDetector';
import './SecurityAnalysis.css';

const SecurityAnalysis = ({ 
  transaction, 
  onRiskAssessment, 
  onApprove, 
  onReject,
  visible = false 
}) => {
  const [scamReport, setScamReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  useEffect(() => {
    if (transaction && visible) {
      analyzeTransactionSecurity(transaction);
    }
  }, [transaction, visible]);

  const analyzeTransactionSecurity = async (tx) => {
    setLoading(true);
    setError(null);
    setScamReport(null);

    try {
      console.log('🔍 Starting security analysis for transaction:', tx);
      
      const scamDetector = new ScamDetector();
      const report = await scamDetector.analyzeTransaction(tx);
      
      setScamReport(report);
      
      // Add to analysis history
      setAnalysisHistory(prev => [{
        timestamp: Date.now(),
        transaction: tx,
        report: report
      }, ...prev.slice(0, 4)]); // Keep last 5 analyses
      
      // Notify parent component
      if (onRiskAssessment) {
        onRiskAssessment(report);
      }
      
      console.log('✅ Security analysis completed:', report);
      
    } catch (error) {
      console.error('❌ Security analysis failed:', error);
      setError(error.message);
      
      // Create fallback report for failed analysis
      const fallbackReport = {
        level: 'medium',
        emoji: '🟡',
        summary: 'Security analysis unavailable',
        warning: 'Unable to verify transaction security. Please proceed with caution.',
        technicalDetails: {
          error: error.message,
          fallback: true
        },
        confidence: 0.1,
        analyzedAt: new Date().toISOString()
      };
      
      setScamReport(fallbackReport);
      
      if (onRiskAssessment) {
        onRiskAssessment(fallbackReport);
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    // Open detailed analysis modal or expand technical details
    const detailsElement = document.querySelector('.technical-details');
    if (detailsElement) {
      detailsElement.open = true;
    }
  };

  const handleProceed = () => {
    console.log('✅ User approved transaction after security review');
    if (onApprove) {
      onApprove(scamReport);
    }
  };

  const handleCancel = () => {
    console.log('❌ User cancelled transaction due to security concerns');
    if (onReject) {
      onReject(scamReport);
    }
  };

  const handleRetryAnalysis = () => {
    if (transaction) {
      analyzeTransactionSecurity(transaction);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="security-analysis">
      <div className="security-header">
        <h3 className="security-title">
          <span className="security-icon">🛡️</span>
          Security Analysis
        </h3>
        
        {transaction && (
          <button 
            className="refresh-analysis"
            onClick={handleRetryAnalysis}
            disabled={loading}
            title="Re-analyze transaction"
          >
            <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
          </button>
        )}
      </div>

      {/* Transaction Summary */}
      {transaction && (
        <div className="transaction-summary">
          <div className="summary-item">
            <span className="summary-label">To:</span>
            <code className="summary-value">{transaction.to}</code>
          </div>
          
          {transaction.value && transaction.value !== '0x0' && (
            <div className="summary-item">
              <span className="summary-label">Value:</span>
              <span className="summary-value">
                {parseInt(transaction.value, 16) / Math.pow(10, 18)} ETH
              </span>
            </div>
          )}
          
          {transaction.data && transaction.data !== '0x' && (
            <div className="summary-item">
              <span className="summary-label">Data:</span>
              <code className="summary-value">
                {transaction.data.substring(0, 42)}...
              </code>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="analysis-error">
          <div className="error-header">
            <span className="error-icon">⚠️</span>
            <span className="error-title">Analysis Failed</span>
          </div>
          <div className="error-message">{error}</div>
          <button 
            className="retry-button"
            onClick={handleRetryAnalysis}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Risk Badge */}
      <RiskBadge
        scamReport={scamReport}
        loading={loading}
        onViewDetails={handleViewDetails}
        onProceed={handleProceed}
        onCancel={handleCancel}
      />

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <details className="analysis-history">
          <summary>
            <span className="history-icon">📊</span>
            Recent Analysis History ({analysisHistory.length})
          </summary>
          <div className="history-content">
            {analysisHistory.map((analysis, index) => (
              <div key={index} className="history-item">
                <div className="history-timestamp">
                  {new Date(analysis.timestamp).toLocaleString()}
                </div>
                <div className="history-result">
                  <span className="history-emoji">{analysis.report.emoji}</span>
                  <span className="history-level">{analysis.report.level}</span>
                  <span className="history-summary">{analysis.report.summary}</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Security Tips */}
      <div className="security-tips">
        <details>
          <summary>
            <span className="tips-icon">💡</span>
            Security Tips
          </summary>
          <div className="tips-content">
            <ul className="tips-list">
              <li>Always verify the contract address before interacting</li>
              <li>Be cautious of unlimited token approvals</li>
              <li>Check if the contract source code is verified</li>
              <li>Research new protocols before investing large amounts</li>
              <li>Use small test transactions for new contracts</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SecurityAnalysis;