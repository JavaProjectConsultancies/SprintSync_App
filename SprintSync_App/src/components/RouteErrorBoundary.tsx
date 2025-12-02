import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface InnerBoundaryState {
  hasError: boolean;
  error?: Error;
}

class InnerErrorBoundary extends React.Component<{ onReset?: () => void }, InnerBoundaryState> {
  constructor(props: { onReset?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): InnerBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Route error boundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full py-8">
          <div className="max-w-md w-full bg-white/70 border rounded-lg p-6 text-center space-y-3">
            <div className="text-lg font-medium text-red-700">Something went wrong</div>
            <div className="text-sm text-muted-foreground">
              {this.state.error?.message || 'The page failed to render.'}
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50"
                onClick={this.reset}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const RouteErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <InnerErrorBoundary
      // Reset boundary state when route changes
      key={location.pathname}
      onReset={() => {
        // optional: navigate to the same path to re-render
        navigate(location.pathname, { replace: true });
      }}
    >
      {children}
    </InnerErrorBoundary>
  );
};

export default RouteErrorBoundary;


