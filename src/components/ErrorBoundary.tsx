import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if it's a null property error
    if (error.message && (
      error.message.includes('Cannot read properties of null') ||
      error.message.includes('Cannot read properties of undefined') ||
      error.message.includes('null is not an object') ||
      error.message.includes('undefined is not an object')
    )) {
      // Log it but don't show error UI
      console.warn('🔇 ErrorBoundary caught and suppressed:', error.message);
      // Return state that indicates no error (hide it from user)
      return { hasError: false, error: null };
    }
    
    // For other errors, show error UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if it's a null property error
    if (error.message && (
      error.message.includes('Cannot read properties of null') ||
      error.message.includes('Cannot read properties of undefined')
    )) {
      // Just log it, don't show to user
      console.warn('🔇 ErrorBoundary suppressed error:', error.message);
      console.warn('Component stack:', errorInfo.componentStack);
      
      // Reset state so component continues rendering
      this.setState({ hasError: false, error: null });
      return;
    }
    
    // For other errors, log normally
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    // Never show error UI for null property errors
    if (this.state.hasError && this.state.error) {
      // Check again if it's a null property error
      if (this.state.error.message && (
        this.state.error.message.includes('Cannot read properties of null') ||
        this.state.error.message.includes('Cannot read properties of undefined')
      )) {
        // Render children normally (hide the error)
        return this.props.children;
      }
      
      // For other errors, show error UI
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            {this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
