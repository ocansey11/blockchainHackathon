import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: '#330000',
          border: '1px solid #ff4444',
          borderRadius: '8px',
          padding: '12px',
          margin: '12px 0',
          color: '#ff6666'
        }}>
          <strong>⚠️ Component Error</strong>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {this.props.fallbackMessage || 'Something went wrong. Please try again.'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
