'use client'

import { Component, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-bg-elevated">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center glass">
              <AlertCircle size={24} className="text-muted" />
            </div>
            <h2 className="text-lg text-secondary mb-2">出了点问题</h2>
            <p className="text-sm text-muted mb-6">
              {this.state.error?.message || '页面遇到了意外错误'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-6 py-2.5 rounded-full text-sm font-medium glass text-secondary hover:bg-white/[0.06] transition-all"
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}