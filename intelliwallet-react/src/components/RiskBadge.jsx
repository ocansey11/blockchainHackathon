import React from 'react';

export default function RiskBadge({ level, emoji, summary, warning }) {
  const color = level === 'high' ? 'red' : level === 'medium' ? 'orange' : 'green';

  return (
    <div style={{
      border: `2px solid ${color}`,
      padding: '12px',
      borderRadius: '8px',
      background: '#1c1c1c',
      color: '#fff',
      marginTop: '10px'
    }}>
      <div style={{ fontSize: '20px' }}>{emoji} <strong>{level.toUpperCase()} RISK</strong></div>
      <div>{summary}</div>
      <small style={{ color: 'gray' }}>{warning}</small>
    </div>
  );
}
