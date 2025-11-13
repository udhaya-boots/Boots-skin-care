import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary - Error details:', {
      error: error.message,
      stack: error.stack,
      errorInfo: errorInfo.componentStack
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#e74c3c', marginBottom: '1rem' }}>
            🚨 Something went wrong
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '500px' }}>
            An unexpected error occurred while loading this page. 
            Please try refreshing or go back to the dashboard.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔄 Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🏠 Go to Dashboard
            </button>
          </div>
          
          {this.state.error && (
            <details style={{ marginTop: '2rem', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#e74c3c' }}>
                Show Error Details
              </summary>
              <pre style={{ 
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.8rem',
                textAlign: 'left',
                marginTop: '1rem'
              }}>
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
