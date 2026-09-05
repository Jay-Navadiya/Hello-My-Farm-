import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary Caught Error]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl max-w-lg mx-auto my-8 text-center space-y-4 text-slate-100 shadow-2xl animate-fade-in relative z-50">
          <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Unable to Render Details View</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred. The application recovered safely.'}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={this.handleReset}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

