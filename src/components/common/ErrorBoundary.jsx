import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Concept Academy ErrorBoundary] Captured error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    try {
      localStorage.setItem('concept_academy_active_tab', 'home');
      localStorage.setItem('aspire_active_tab', 'home');
      window.history.replaceState({ tab: 'home' }, '');
    } catch (e) {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = window.location.origin + window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--canvas, #f8fafc)',
          color: 'var(--brand-900, #0f172a)',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'var(--surface, #ffffff)',
            borderRadius: '20px',
            padding: '28px 24px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={30} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--brand-900, #0f172a)' }}>
              Something Went Wrong
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', margin: 0, lineHeight: 1.5 }}>
              The screen encountered an unexpected state. Tap reload or return home to restore the dashboard smoothly.
            </p>

            {this.state.error?.message && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
                textAlign: 'left',
                width: '100%',
                wordBreak: 'break-word',
                maxHeight: '80px',
                overflowY: 'auto'
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '6px' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--brand-900, #1e3a8a)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)'
                }}
              >
                <RefreshCw size={16} />
                <span>Reload Screen</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  width: '100%',
                  padding: '11px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border, #cbd5e1)',
                  background: 'var(--surface-alt, #f1f5f9)',
                  color: 'var(--text-primary, #1e293b)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Home size={15} />
                <span>Go to Home Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
