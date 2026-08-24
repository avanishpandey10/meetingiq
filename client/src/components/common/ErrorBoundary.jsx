import React from 'react';
import { AlertIcon, RefreshIcon, XIcon } from './Icons';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <AlertIcon size={48} color="#ef4444" />
            </div>

            <h2>Something went wrong</h2>

            <p>An unexpected error occurred. Please try again.</p>

            {this.state.error && (
              <div className="error-details">
                <p className="error-message">
                  {this.state.error.message || 'Unknown error'}
                </p>
              </div>
            )}

            <div className="error-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                <RefreshIcon size={16} />
                Try Again
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                <RefreshIcon size={16} />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;