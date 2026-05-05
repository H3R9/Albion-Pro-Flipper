'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 rounded-xl bg-[var(--mw-card)]/80 border border-[var(--mw-border)] shadow-xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--mw-red)]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--mw-gold-primary)]/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-[var(--mw-red)]/10 border-2 border-[var(--mw-red)]/30 flex items-center justify-center">
              <AlertTriangle size={32} className="text-[var(--mw-red)]" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[var(--mw-text-main)] uppercase tracking-wider mb-2">
                Algo deu errado
              </h3>
              <p className="text-sm text-[var(--mw-text-muted)] leading-relaxed">
                Um erro inesperado ocorreu neste módulo. Seus dados estão seguros — tente recarregar o componente.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-3 text-left">
                <p className="text-sm text-[var(--mw-text-muted)] uppercase tracking-widest font-bold mb-1">
                  Detalhe Técnico
                </p>
                <code className="text-sm text-[var(--mw-red)] font-mono break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--mw-gold-primary)] hover:bg-[var(--mw-gold-bright)] text-black font-black uppercase tracking-wider text-sm rounded-xl transition shadow-md mt-2"
            >
              <RefreshCw size={16} />
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
